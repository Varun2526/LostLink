import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import authRoutes from "./src/routes/authRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import claimRoutes from "./src/routes/claimRoutes.js";
import connectDB from "./src/config/db.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), ".env") });

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/claims", claimRoutes);

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