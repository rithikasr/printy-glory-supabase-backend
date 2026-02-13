import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

import {
  getUserCart,
  addToCart,
  moveToSaveForLater,
  moveBackToCart,
  removeFromCart
} from "../controllers/cart.controller";

const router = Router();

router.get("/cart", authMiddleware, getUserCart);
router.post("/cart/add", authMiddleware, addToCart);
router.post("/cart/save-for-later", authMiddleware, moveToSaveForLater);
router.post("/cart/move-to-cart", authMiddleware, moveBackToCart);
router.post("/cart/remove", authMiddleware, removeFromCart);

export default router;
