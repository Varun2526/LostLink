import express from "express";

import {
  getNotifications,
  markRead,
  markAllRead,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);

router.patch("/read-all", authMiddleware, markAllRead);

router.patch("/:id/read", authMiddleware, markRead);

export default router;
