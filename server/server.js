import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import authRoutes from "./src/routes/authRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import claimRoutes from "./src/routes/claimRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import { apiLimiter } from "./src/middleware/rateLimiter.js";
import connectDB from "./src/config/db.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), ".env") });

const app = express();

// Render/Vercel put a proxy in front of us, so the rate limiter needs
// to trust X-Forwarded-For to see the real client IP
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    message: "LostLink API is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`LostLink server running on http://localhost:${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB unavailable:", error.message);
  }
};

startServer();