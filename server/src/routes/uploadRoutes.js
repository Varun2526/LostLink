import express from "express";

import { uploadImage } from "../controllers/uploadController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// multer errors (wrong type, too big) arrive here as a thrown error,
// so they are turned into a normal json response
const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    next();
  });
};

router.post("/", authMiddleware, writeLimiter, handleUpload, uploadImage);

export default router;
