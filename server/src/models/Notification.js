import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // who should see this
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["claim_received", "claim_approved", "claim_rejected", "match_found"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      default: "",
    },

    // where clicking the notification should take them
    link: {
      type: String,
      default: "/",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
