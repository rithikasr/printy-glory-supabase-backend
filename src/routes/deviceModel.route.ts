import { Router } from "express";
import {
    createDeviceModel,
    getDeviceModels,
    updateDeviceModel,
    deleteDeviceModel
} from "../controllers/deviceModel.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// Public routes
router.get("/", getDeviceModels);

// Admin routes - protected
router.post("/", authMiddleware, adminMiddleware, createDeviceModel);
router.patch("/:id", authMiddleware, adminMiddleware, updateDeviceModel);
router.delete("/:id", authMiddleware, adminMiddleware, deleteDeviceModel);

export default router;
