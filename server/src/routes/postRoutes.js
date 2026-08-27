import express from "express";

import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
  getMatches,
  getMyPosts,
} from "../controllers/postController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import {
  createPostRules,
  updatePostRules,
} from "../validators/postValidators.js";

const router = express.Router();

// public routes
// /search must be above /:id so it is not treated as an id
router.get("/", getPosts);

router.get("/search", searchPosts);

// must stay above /:id so "mine" is not read as an id
router.get("/mine", authMiddleware, getMyPosts);

router.get("/:id", getPostById);

router.get("/:id/matches", getMatches);

// protected routes
router.post("/", authMiddleware, writeLimiter, createPostRules, validate, createPost);

router.patch("/:id", authMiddleware, updatePostRules, validate, updatePost);

router.delete("/:id", authMiddleware, deletePost);

export default router;
