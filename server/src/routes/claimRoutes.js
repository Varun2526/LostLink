import express from "express";

import {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  approveClaim,
  rejectClaim,
} from "../controllers/claimController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import { createClaimRules } from "../validators/claimValidators.js";

const router = express.Router();

// every claim route needs a logged in user
router.post("/", authMiddleware, writeLimiter, createClaimRules, validate, createClaim);

router.get("/my", authMiddleware, getMyClaims);

router.get("/received", authMiddleware, getReceivedClaims);

router.patch("/:id/approve", authMiddleware, approveClaim);

router.patch("/:id/reject", authMiddleware, rejectClaim);

export default router;
