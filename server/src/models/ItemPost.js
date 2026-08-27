import mongoose from "mongoose";

const itemPostSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["lost", "found"],
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    verificationQuestion: {
      type: String,
      default: null,
    },

    // select: false keeps the answer out of every normal query result.
    // It can only come back with .select("+verificationAnswer").
    verificationAnswer: {
      type: String,
      default: null,
      select: false,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "claimed", "resolved"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const ItemPost = mongoose.model("ItemPost", itemPostSchema);

export default ItemPost;
