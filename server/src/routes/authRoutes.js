import express from "express";

import { signup, login, refresh, logout } from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  signupRules,
  loginRules,
  refreshRules,
} from "../validators/authValidators.js";

const router = express.Router();

router.post("/signup", authLimiter, signupRules, validate, signup);

router.post("/login", authLimiter, loginRules, validate, login);

router.post("/refresh", refreshRules, validate, refresh);

router.post("/logout", logout);

export default router;
