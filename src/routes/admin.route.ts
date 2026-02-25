import { Router } from "express";
import { getAllOrders } from "../controllers/adminOrders.controller";
import { makeAdmin } from "../controllers/auth.controller";

const router = Router();

// Note: authMiddleware and adminMiddleware are applied in route.ts to all /admin routes
router.get("/orders", getAllOrders);
router.patch("/make-admin", makeAdmin);

export default router;
