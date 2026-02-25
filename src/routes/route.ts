import express from "express";
import adminRoutes from "./admin.route";
import productRoutes from "./product.route";
import authRoutes from "./auth.route";
import forgotRoutes from "./forgot.route";
import paymentRoutes from "./payment.routes";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import orderRoutes from "./order.route";
import cartRoutes from "./cart.route";
import phoneModelRoutes from "./phoneModel.route";
import pricingRoutes from "./pricing.route";
import uploadRoutes from "./upload.route";
import contactRoutes from "./contact.route";
import deviceModelRoutes from "./deviceModel.route";

const commonRouter = express.Router();


// Public routes (no auth required)
commonRouter.use("/auth", authRoutes)
    .use("/auth", forgotRoutes)
    .use("/api", productRoutes) // Products are now public for browsing
    .use("/api/phone-models", phoneModelRoutes) // Phone model requests
    .use("/api", pricingRoutes) // Pricing routes (public GET, protected admin endpoints)
    .use("/api/upload", uploadRoutes) // Upload routes
    .use("/api/contact", contactRoutes) // Public contact form submission
    .use("/api/device-models", deviceModelRoutes); // Dynamic device frames

// Protected routes (auth required)
commonRouter.use("/api/payment", authMiddleware, paymentRoutes) // Auth required for payment
    .use("/webhooks", express.raw({ type: "application/json" }), paymentRoutes)
    .use("/admin", authMiddleware, adminMiddleware, adminRoutes) // Admin only
    .use("/admin/contact", authMiddleware, adminMiddleware, contactRoutes) // Admin only
    .use("/api/orders", orderRoutes) // Already has auth middleware inside
    .use("/api", authMiddleware, cartRoutes); // Auth required for cart

export default commonRouter;
