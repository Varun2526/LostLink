import mongoose from "mongoose";

import Claim from "../models/Claim.js";
import ItemPost from "../models/ItemPost.js";
import User from "../models/User.js";
import notify from "../utils/notify.js";

// answers are compared loosely so "Blue " and "blue" both work
const normalize = (value) => {
  return String(value).trim().toLowerCase();
};

const createClaim = async (req, res) => {
  try {
    const { postId, answer, message } = req.body;

    if (!postId || !answer) {
      return res.status(400).json({
        message: "Post id and answer are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // we need the real answer here, so we ask for it explicitly
    const post = await ItemPost.findById(postId).select("+verificationAnswer");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.type !== "found") {
      return res.status(400).json({
        message: "You can only claim found items",
      });
    }

    if (post.postedBy.toString() === req.userId) {
      return res.status(400).json({
        message: "You cannot claim your own post",
      });
    }

    if (post.status !== "open") {
      return res.status(400).json({
        message: "This item is no longer open for claims",
      });
    }

    const existingClaim = await Claim.findOne({
      post: post._id,
      claimant: req.userId,
    });

    if (existingClaim) {
      return res.status(400).json({
        message: "You have already claimed this item",
      });
    }

    const answerMatched =
      normalize(answer) === normalize(post.verificationAnswer);

    const claim = await Claim.create({
      post: post._id,
      claimant: req.userId,
      owner: post.postedBy,
      answer,
      answerMatched,
      message: message || "",
      status: "pending",
    });

    const claimant = await User.findById(req.userId).select("name");

    await notify({
      user: post.postedBy,
      type: "claim_received",
      title: "New claim on your post",
      body: `${claimant ? claimant.name : "Someone"} claimed "${post.title}"`,
      link: "/received-claims",
    });

    // the claimant is never told whether the answer matched,
    // otherwise they could guess the answer one try at a time
    res.status(201).json({
      message: "Claim submitted successfully",
      claim: {
        id: claim._id,
        post: claim.post,
        status: claim.status,
        message: claim.message,
        createdAt: claim.createdAt,
      },
    });
  } catch (error) {
    console.log("Create claim error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already claimed this item",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.userId })
      .sort({ createdAt: -1 })
      .populate("post", "title type category location status verificationQuestion")
      .populate("owner", "name campus");

    res.json({
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.log("Get my claims error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getReceivedClaims = async (req, res) => {
  try {
    // the post owner is allowed to see the submitted answer
    // and whether it matched
    const claims = await Claim.find({ owner: req.userId })
      .select("+answer +answerMatched")
      .sort({ createdAt: -1 })
      .populate("post", "title type category location status")
      .populate("claimant", "name email campus");

    res.json({
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.log("Get received claims error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const approveClaim = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    if (claim.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only approve claims on your own post",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "This claim has already been handled",
      });
    }

    claim.status = "approved";

    await claim.save();

    // the item is now claimed
    const post = await ItemPost.findById(claim.post);

    if (post) {
      post.status = "claimed";

      await post.save();
    }

    await notify({
      user: claim.claimant,
      type: "claim_approved",
      title: "Your claim was approved",
      body: post
        ? `You can collect "${post.title}" from the finder`
        : "You can collect the item from the finder",
      link: "/my-claims",
    });

    // everyone else waiting on this post is rejected
    const others = await Claim.find({
      post: claim.post,
      _id: { $ne: claim._id },
      status: "pending",
    }).select("claimant");

    await Promise.all(
      others.map((other) =>
        notify({
          user: other.claimant,
          type: "claim_rejected",
          title: "Your claim was not approved",
          body: post
            ? `Someone else was verified as the owner of "${post.title}"`
            : "Someone else was verified as the owner",
          link: "/my-claims",
        })
      )
    );

    await Claim.updateMany(
      {
        post: claim.post,
        _id: { $ne: claim._id },
        status: "pending",
      },
      {
        status: "rejected",
      }
    );

    res.json({
      message: "Claim approved successfully",
      claim: {
        id: claim._id,
        post: claim.post,
        status: claim.status,
      },
    });
  } catch (error) {
    console.log("Approve claim error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    if (claim.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only reject claims on your own post",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "This claim has already been handled",
      });
    }

    claim.status = "rejected";

    await claim.save();

    const rejectedPost = await ItemPost.findById(claim.post).select("title");

    await notify({
      user: claim.claimant,
      type: "claim_rejected",
      title: "Your claim was not approved",
      body: rejectedPost
        ? `The finder rejected your claim on "${rejectedPost.title}"`
        : "The finder rejected your claim",
      link: "/my-claims",
    });

    res.json({
      message: "Claim rejected successfully",
      claim: {
        id: claim._id,
        post: claim.post,
        status: claim.status,
      },
    });
  } catch (error) {
    console.log("Reject claim error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  approveClaim,
  rejectClaim,
};
