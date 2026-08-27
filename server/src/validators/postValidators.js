import { body } from "express-validator";

const createPostRules = [
  body("type")
    .trim()
    .isIn(["lost", "found"])
    .withMessage("Type must be lost or found"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 120 })
    .withMessage("Title is too long")
    .escape(),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 60 })
    .withMessage("Category is too long")
    .escape(),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description is too long")
    .escape(),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ max: 120 })
    .withMessage("Location is too long")
    .escape(),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Please enter a valid date"),

  body("imageUrl")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("Image URL must be a valid link"),

  // only required when the post is a found item
  body("verificationQuestion")
    .if(body("type").equals("found"))
    .trim()
    .notEmpty()
    .withMessage("Verification question is required for found items")
    .isLength({ max: 200 })
    .withMessage("Verification question is too long")
    .escape(),

  body("verificationAnswer")
    .if(body("type").equals("found"))
    .trim()
    .notEmpty()
    .withMessage("Verification answer is required for found items")
    .isLength({ max: 200 })
    .withMessage("Verification answer is too long"),
];

const updatePostRules = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 120 }).withMessage("Title is too long").escape(),

  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty")
    .isLength({ max: 60 }).withMessage("Category is too long").escape(),

  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty")
    .isLength({ max: 2000 }).withMessage("Description is too long").escape(),

  body("location").optional().trim().notEmpty().withMessage("Location cannot be empty")
    .isLength({ max: 120 }).withMessage("Location is too long").escape(),

  body("date").optional().isISO8601().withMessage("Please enter a valid date"),

  body("imageUrl").optional({ values: "falsy" }).trim().isURL()
    .withMessage("Image URL must be a valid link"),

  body("status").optional().trim().isIn(["open", "claimed", "resolved"])
    .withMessage("Status must be open, claimed or resolved"),
];

export { createPostRules, updatePostRules };
