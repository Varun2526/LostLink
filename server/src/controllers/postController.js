import mongoose from "mongoose";

import ItemPost from "../models/ItemPost.js";
import { findMatches } from "../utils/matching.js";

// verificationAnswer is select:false in the model, so normal queries never
// return it. create() still gives it back, so we strip it here as well.
const safePost = (post) => {
  const plain = post.toObject ? post.toObject() : post;

  delete plain.verificationAnswer;

  return plain;
};

const createPost = async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      location,
      date,
      imageUrl,
      verificationQuestion,
      verificationAnswer,
    } = req.body;

    if (!type || !title || !category || !description || !location || !date) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (type !== "lost" && type !== "found") {
      return res.status(400).json({
        message: "Type must be lost or found",
      });
    }

    let question = null;
    let answer = null;

    if (type === "found") {
      if (!verificationQuestion || !verificationAnswer) {
        return res.status(400).json({
          message:
            "Verification question and answer are required for found items",
        });
      }

      question = verificationQuestion;
      answer = verificationAnswer;
    }

    const post = await ItemPost.create({
      type,
      title,
      category,
      description,
      location,
      date,
      imageUrl: imageUrl || "",
      verificationQuestion: question,
      verificationAnswer: answer,
      postedBy: req.userId,
      status: "open",
    });

    res.status(201).json({
      message: "Post created successfully",
      post: safePost(post),
    });
  } catch (error) {
    console.log("Create post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await ItemPost.find({ status: "open" })
      .sort({ createdAt: -1 })
      .populate("postedBy", "name campus");

    res.json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.log("Get posts error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = await ItemPost.findById(id).populate(
      "postedBy",
      "name campus"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      post,
    });
  } catch (error) {
    console.log("Get post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = await ItemPost.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.postedBy.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only update your own post",
      });
    }

    const {
      title,
      category,
      description,
      location,
      date,
      imageUrl,
      status,
    } = req.body;

    if (title) {
      post.title = title;
    }

    if (category) {
      post.category = category;
    }

    if (description) {
      post.description = description;
    }

    if (location) {
      post.location = location;
    }

    if (date) {
      post.date = date;
    }

    if (imageUrl !== undefined) {
      post.imageUrl = imageUrl;
    }

    if (status) {
      // "claimed" is set by the backend when a claim is approved.
      // Letting a user set it here would skip the whole claim flow.
      if (status === "claimed") {
        return res.status(400).json({
          message: "Status claimed is only set by approving a claim",
        });
      }

      if (status !== "open" && status !== "resolved") {
        return res.status(400).json({
          message: "Status must be open or resolved",
        });
      }

      post.status = status;
    }

    await post.save();

    res.json({
      message: "Post updated successfully",
      post: safePost(post),
    });
  } catch (error) {
    console.log("Update post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = await ItemPost.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.postedBy.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only delete your own post",
      });
    }

    await post.deleteOne();

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log("Delete post error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const searchPosts = async (req, res) => {
  try {
    const { q, category, type } = req.query;

    const query = {
      status: "open",
    };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (type === "lost" || type === "found") {
      query.type = type;
    }

    const posts = await ItemPost.find(query)
      .sort({ createdAt: -1 })
      .populate("postedBy", "name campus");

    res.json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.log("Search posts error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Suggests posts of the opposite type that look like the same item.
// A lost post is matched against found posts and the other way around.
const getMatches = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = await ItemPost.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const oppositeType = post.type === "lost" ? "found" : "lost";

    const candidates = await ItemPost.find({
      type: oppositeType,
      status: "open",
      _id: { $ne: post._id },
    }).populate("postedBy", "name campus");

    const matches = findMatches(post, candidates);

    res.json({
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.log("Get matches error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
  getMatches,
};
