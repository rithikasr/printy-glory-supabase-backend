import { Router } from "express";

import {
  getUserCart,
  addToCart,
  moveToSaveForLater,
  moveBackToCart,
  removeFromCart,
  removeFromSavedForLater
} from "../controllers/cart.controller";

const router = Router();

// All cart routes require auth (applied at router level in route.ts)
router.get("/cart", getUserCart);
router.post("/cart/add", addToCart);
router.post("/cart/save-for-later", moveToSaveForLater);
router.post("/cart/move-to-cart", moveBackToCart);
router.post("/cart/remove", removeFromCart);
router.post("/cart/remove-saved", removeFromSavedForLater);

export default router;
