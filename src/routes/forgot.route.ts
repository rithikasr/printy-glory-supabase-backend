import { Router } from "express";
import { forgotPassword, verifyOtp, resetPassword } from "../controllers/forgot.controller";

const router = Router();

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
