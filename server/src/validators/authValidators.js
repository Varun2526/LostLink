import { body } from "express-validator";

const signupRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters")
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be at least 6 characters"),

  body("campus")
    .trim()
    .notEmpty()
    .withMessage("Campus is required")
    .isLength({ max: 100 })
    .withMessage("Campus name is too long")
    .escape(),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const refreshRules = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

export { signupRules, loginRules, refreshRules };
