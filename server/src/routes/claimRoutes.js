import express from "express";

import {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  approveClaim,
  rejectClaim,
} from "../controllers/claimController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// every claim route needs a logged in user
router.post("/", authMiddleware, createClaim);

router.get("/my", authMiddleware, getMyClaims);

router.get("/received", authMiddleware, getReceivedClaims);

router.patch("/:id/approve", authMiddleware, approveClaim);

router.patch("/:id/reject", authMiddleware, rejectClaim);

export default router;
