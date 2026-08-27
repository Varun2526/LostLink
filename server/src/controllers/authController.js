import bcrypt from "bcryptjs";

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { issueTokens, createAccessToken } from "../utils/tokens.js";

const safeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    campus: user.campus,
  };
};

const signup = async (req, res) => {
  try {
    const { name, email, password, campus } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      campus,
    });

    const { accessToken, refreshToken } = await issueTokens(user._id);

    res.status(201).json({
      message: "Signup successful",
      token: accessToken,
      refreshToken,
      user: safeUser(user),
    });
  } catch (error) {
    console.log("Signup error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = await issueTokens(user._id);

    res.json({
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: safeUser(user),
    });
  } catch (error) {
    console.log("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Swaps a valid refresh token for a fresh access token. The refresh token
// is rotated at the same time, so a stolen one stops working as soon as
// the real user refreshes.
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const saved = await RefreshToken.findOne({ token: refreshToken });

    if (!saved) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    if (saved.expiresAt < new Date()) {
      await saved.deleteOne();

      return res.status(401).json({
        message: "Refresh token expired, please log in again",
      });
    }

    const user = await User.findById(saved.user);

    if (!user) {
      await saved.deleteOne();

      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // rotate: the old one is destroyed and a new pair goes out
    await saved.deleteOne();

    const tokens = await issueTokens(user._id);

    res.json({
      message: "Token refreshed",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: safeUser(user),
    });
  } catch (error) {
    console.log("Refresh error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Logout error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export { signup, login, refresh, logout, createAccessToken };
