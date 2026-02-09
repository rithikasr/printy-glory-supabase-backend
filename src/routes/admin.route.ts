import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import { getAllOrders } from "../controllers/adminOrders.controller";

const router = Router();
router.get("/orders", authMiddleware, getAllOrders);


// router.get("/orders", authMiddleware, async (req, res) => {
//   res.json({ message: "Protected orders route works!" });
// });

// router.get("/orders", getAllOrders);


// router.get("/orders", auth, adminAuth, getAllOrders); //authorization


// router.get("/admin/orders", auth, adminAuth, getAllOrders);

export default router;
