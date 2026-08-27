import crypto from "crypto";
import jwt from "jsonwebtoken";

import RefreshToken from "../models/RefreshToken.js";

// short lived, sent with every request
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

// long lived, only used to get a new access token
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);

// jti makes every token unique. Without it two tokens signed in the same
// second for the same user are byte identical, so a refresh looks like it
// did nothing.
const createAccessToken = (userId) => {
  return jwt.sign(
    {
      userId,
      jti: crypto.randomUUID(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

// A random string rather than a JWT. It means nothing on its own, it is
// only valid while the matching row exists in the database.
const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(48).toString("hex");

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
  });

  return token;
};

const issueTokens = async (userId) => {
  const accessToken = createAccessToken(userId);
  const refreshToken = await createRefreshToken(userId);

  return { accessToken, refreshToken };
};

export {
  createAccessToken,
  createRefreshToken,
  issueTokens,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_DAYS,
};
