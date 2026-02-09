import express from "express";
import { createCheckoutSession, stripeWebhookHandler } from "../controllers/payment.controller";

const router = express.Router();

// Stripe checkout
router.post("/create-checkout-session", createCheckoutSession);

// Stripe webhook (must NOT use express.json)
// router.post(
//   "/stripe-webhook",
//   express.raw({ type: "application/json" }),
//   stripeWebhookHandler
// );

export default router;
