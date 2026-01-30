import * as dotenv from "dotenv";
import { connectDB } from "./config/mongodb";
dotenv.config();

import express from "express";
import webhookRoutes from "./routes/webhook.route";
import adminRoutes from "./routes/admin.route";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  "/webhooks",
  webhookRoutes
);
app.use(express.json());
app.use(adminRoutes);

/**
 * Stripe webhook MUST receive raw body
 * This middleware applies ONLY to /webhooks
 */


/**
 * JSON body parser for all other routes
 * (add these later when you create APIs)
 */
// app.use(express.json());
// app.use("/api", apiRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export default app;
