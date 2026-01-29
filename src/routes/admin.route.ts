import { Router } from "express";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import { getAllOrders } from "../controllers/adminOrders.controller";

const router = Router();

router.get("/admin/orders", auth, adminAuth, getAllOrders);

export default router;
