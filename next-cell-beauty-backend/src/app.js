import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error.js";
import { connectDb, isDbConnected } from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import customerAuthRoutes from "./routes/customerAuthRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import tutorialRoutes from "./routes/tutorialRoutes.js";
import skinQuizRoutes from "./routes/skinQuizRoutes.js";
import shadeFinderRoutes from "./routes/shadeFinderRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import comboRoutes from "./routes/comboRoutes.js";
import beforeAfterRoutes from "./routes/beforeAfterRoutes.js";

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: true, credentials: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests from this IP, please try again later." }
});
app.use("/api", limiter);

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve Uploads Directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check Endpoint
app.get("/healthz", async (req, res) => {
  try {
    await connectDb();
    return res.status(200).json({ status: "ok", database: isDbConnected() ? "connected" : "disconnected" });
  } catch (error) {
    return res.status(500).json({ status: "error", database: "disconnected", error: error.message });
  }
});

// API Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/user", customerAuthRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", brandRoutes);
app.use("/api", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", returnRoutes);
app.use("/api", couponRoutes);
app.use("/api", customerRoutes);
app.use("/api", reviewRoutes);
app.use("/api", tutorialRoutes);
app.use("/api", skinQuizRoutes);
app.use("/api", shadeFinderRoutes);
app.use("/api", bannerRoutes);
app.use("/api", blogRoutes);
app.use("/api", faqRoutes);
app.use("/api", policyRoutes);
app.use("/api", settingRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", uploadRoutes);
app.use("/api", comboRoutes);
app.use("/api", beforeAfterRoutes);

// Error Handling
app.use(errorHandler);

export default app;
