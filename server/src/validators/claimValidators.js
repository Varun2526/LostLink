import { body } from "express-validator";

const createClaimRules = [
  body("postId")
    .trim()
    .notEmpty()
    .withMessage("Post id is required")
    .isMongoId()
    .withMessage("That post id is not valid"),

  body("answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required")
    .isLength({ max: 200 })
    .withMessage("Answer is too long"),

  body("message")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Message is too long")
    .escape(),
];

export { createClaimRules };
