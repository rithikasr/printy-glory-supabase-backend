import express from "express";
import { stripeWebhookHandler } from "../controllers/stripeWebhook.controller";

const router = express.Router();

router.post("/stripe",  express.raw({ type: "application/json" }),
 stripeWebhookHandler);

export default router;




// import express from "express";
// import { stripeWebhookHandler } from "../controllers/stripeWebhook.controller";

// const router = express.Router();

// // IMPORTANT: raw body for Stripe
// router.post(
//   "/stripe",
//   express.raw({ type: "application/json" }),
//   stripeWebhookHandler
// );

// export default router;
