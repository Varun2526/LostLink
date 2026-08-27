import { validationResult } from "express-validator";

// Runs after the express-validator checks on a route and turns any
// failures into the same { message } shape the rest of the API returns,
// plus a field list the frontend can show next to each input.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const fields = {};

  errors.array().forEach((error) => {
    if (!fields[error.path]) {
      fields[error.path] = error.msg;
    }
  });

  return res.status(400).json({
    message: errors.array()[0].msg,
    fields,
  });
};

export default validate;
