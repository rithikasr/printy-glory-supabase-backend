import express from "express";
import webhookRoutes from "./routes/webhook.route";
import adminRoutes from "./routes/admin.route";


const app = express();

/**
 * Stripe webhook MUST receive raw body
 * This middleware applies ONLY to /webhooks
 */
app.use(
  "/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);
app.use(express.json());
app.use(adminRoutes);

/**
 * JSON body parser for all other routes
 * (add these later when you create APIs)
 */
// app.use(express.json());
// app.use("/api", apiRoutes);

export default app;
