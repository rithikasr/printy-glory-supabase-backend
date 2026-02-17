import { Router } from "express";
import {
    createPhoneModelRequest,
    getAllPhoneModelRequests,
    updatePhoneModelRequestStatus
} from "../controllers/phoneModel.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public route - anyone can request a phone model
router.post("/request", createPhoneModelRequest);

// Admin routes - protected
router.get("/requests", authMiddleware, getAllPhoneModelRequests);
router.patch("/requests/:id/status", authMiddleware, updatePhoneModelRequestStatus);

export default router;
