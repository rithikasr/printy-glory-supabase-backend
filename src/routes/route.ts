import express from "express";
import adminRoutes from "./admin.route";
import productRoutes from "./product.route";
import authRoutes from "./auth.route";
import forgotRoutes from "./forgot.route";
import paymentRoutes from "./payment.routes";
import { authMiddleware } from "../middleware/auth";
import orderRoutes from "./order.route";

const commonRouter = express.Router();

commonRouter.use("/api/payment", paymentRoutes)
            .use("/webhooks", express.raw({ type: "application/json" }), paymentRoutes)
            .use("/auth", authRoutes)
            .use("/auth", forgotRoutes)
            .use("/admin", authMiddleware, adminRoutes)
            .use("/api", authMiddleware, productRoutes)
            .use("/api/orders", orderRoutes);

export default commonRouter;
