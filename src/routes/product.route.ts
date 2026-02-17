import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller";
import { upload } from "../middleware/upload";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public routes (no auth required)
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// Protected routes (auth required for admin operations)
router.post("/products", authMiddleware, upload.single("image"), createProduct);
router.put("/products/:id", authMiddleware, upload.single("image"), updateProduct);
router.delete("/products/:id", authMiddleware, deleteProduct);

export default router;