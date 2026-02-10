import { Router } from "express";
import { 
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller";
import { upload } from "../middleware/upload";

const router = Router();

// CRUD Routes
// router.post("/products", createProduct);
router.post("/products", upload.single("image"), createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload.single("image"), updateProduct);
// router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;