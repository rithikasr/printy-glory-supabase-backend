import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getMyOrders } from "../controllers/order.controller";
import { getAllOrders } from "../controllers/adminOrders.controller";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

// User order history
router.get("/my-orders", authMiddleware, getMyOrders);

// Admin all orders
router.get("/all", authMiddleware, adminAuth, getAllOrders);

export default router;
