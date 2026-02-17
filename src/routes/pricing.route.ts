import { Router } from "express";
import {
    getAllPricing,
    getPricingByType,
    setPhoneCasePricing,
    setTShirtPricing,
    deletePricing,
    initializeDefaultPricing
} from "../controllers/pricing.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public routes - Frontend can fetch current pricing
router.get("/pricing/:type", getPricingByType); // GET /api/pricing/phone-case or /api/pricing/t-shirt

// Admin routes - Manage pricing (protected)
router.get("/admin/pricing", authMiddleware, getAllPricing); // GET all pricing configs
router.post("/admin/pricing/phone-case", authMiddleware, setPhoneCasePricing); // Set phone case price
router.post("/admin/pricing/t-shirt", authMiddleware, setTShirtPricing); // Set t-shirt prices
router.delete("/admin/pricing/:type", authMiddleware, deletePricing); // Delete pricing config
router.post("/admin/pricing/initialize", authMiddleware, initializeDefaultPricing); // Initialize defaults

export default router;
