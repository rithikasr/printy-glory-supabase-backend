import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getMyOrders, approveOrder, rejectOrder } from "../controllers/order.controller";
import { getAllOrders } from "../controllers/adminOrders.controller";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

// User order history
router.get("/my-orders", authMiddleware, getMyOrders);
router.post("/:id/approve", authMiddleware, approveOrder);
router.post("/:id/reject", authMiddleware, rejectOrder);

// Admin all orders
router.get("/all", authMiddleware, adminAuth, getAllOrders);

export default router;
