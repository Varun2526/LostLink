import mongoose from "mongoose";

import Notification from "../models/Notification.js";

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.userId,
      read: false,
    });

    res.json({
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.log("Get notifications error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({
        message: "That is not your notification",
      });
    }

    notification.read = true;

    await notification.save();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log("Mark read error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log("Mark all read error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export { getNotifications, markRead, markAllRead };
