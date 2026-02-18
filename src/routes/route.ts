import express from "express";
import adminRoutes from "./admin.route";
import productRoutes from "./product.route";
import authRoutes from "./auth.route";
import forgotRoutes from "./forgot.route";
import paymentRoutes from "./payment.routes";
import { authMiddleware } from "../middleware/auth";
import orderRoutes from "./order.route";
import cartRoutes from "./cart.route";
import phoneModelRoutes from "./phoneModel.route";
import pricingRoutes from "./pricing.route";
import uploadRoutes from "./upload.route";

const commonRouter = express.Router();


// Public routes (no auth required)
commonRouter.use("/auth", authRoutes)
    .use("/auth", forgotRoutes)
    .use("/api", productRoutes) // Products are now public for browsing
    .use("/api/phone-models", phoneModelRoutes) // Phone model requests
    .use("/api", pricingRoutes) // Pricing routes (public GET, protected admin endpoints)
    .use("/api/upload", uploadRoutes); // Upload routes

// Protected routes (auth required)
commonRouter.use("/api/payment", authMiddleware, paymentRoutes) // Auth required for payment
    .use("/webhooks", express.raw({ type: "application/json" }), paymentRoutes)
    .use("/admin", authMiddleware, adminRoutes)
    .use("/api/orders", orderRoutes) // Already has auth middleware inside
    .use("/api", authMiddleware, cartRoutes); // Auth required for cart

export default commonRouter;
