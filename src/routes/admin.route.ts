import { Router } from "express";
import { getAllOrders, getOrderById, updateOrderStatus, requestOrderApproval } from "../controllers/adminOrders.controller";
import { makeAdmin } from "../controllers/auth.controller";
import { adminGetProducts, toggleProductActive } from "../controllers/product.controller";
import { upload } from "../middleware/upload";

const router = Router();

// Note: authMiddleware and adminMiddleware are applied in route.ts to all /admin routes
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/request-approval", upload.single("approvalImage"), requestOrderApproval);

// Product management
router.get("/products", adminGetProducts);
router.patch("/products/:id/toggle-active", toggleProductActive);

router.patch("/make-admin", makeAdmin);

export default router;
