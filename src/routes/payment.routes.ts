import express from "express";
import { createCheckoutSession, createCartCheckoutSession, stripeWebhookHandler } from "../controllers/payment.controller";

const router = express.Router();

// Single-product checkout (PhoneCaseCustomizer / TShirtCustomizer "Buy Now")
router.post("/create-checkout-session", createCheckoutSession);

// Multi-item cart checkout (Cart page "Proceed to Checkout")
router.post("/cart-checkout-session", createCartCheckoutSession);

// Stripe webhook (must NOT use express.json — leave commented until webhook is configured)
// router.post(
//   "/stripe-webhook",
//   express.raw({ type: "application/json" }),
//   stripeWebhookHandler
// );

export default router;
