import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemPost",
      required: true,
    },

    // the user who is trying to claim the item
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // the user who posted the found item (kept here so
    // "received claims" is a single simple query)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // the claimant's answer to the verification question.
    // Only the owner of the post is ever shown this.
    answer: {
      type: String,
      required: true,
      select: false,
    },

    // whether the answer matched the post's verificationAnswer.
    // Hidden from the claimant so they cannot brute force the answer.
    answerMatched: {
      type: Boolean,
      default: false,
      select: false,
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// one claim per user per post
claimSchema.index({ post: 1, claimant: 1 }, { unique: true });

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;
