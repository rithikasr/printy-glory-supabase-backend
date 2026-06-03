// Force Node.js to use Google DNS for MongoDB connections
// This fixes DNS resolution issues with local DNS servers
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import * as dotenv from "dotenv";
import { connectDB } from "./config/mongodb";
dotenv.config();

import express from "express";
import cors from "cors";


import { stripeWebhookHandler } from "./controllers/payment.controller";

import commonRouter from "./routes/route";

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------- CORS (MUST BE FIRST) ---------------------
app.use(cors({ origin: "*" }));

// ---------------------- STRIPE WEBHOOK FIRST ----------------------
// Stripe webhooks need the raw body for signature verification.
// We set a large limit (50mb) to handle complex checkout sessions.
app.post(
  "/api/payment/stripe-webhook",
  express.raw({ type: "application/json", limit: "50mb" }),
  stripeWebhookHandler
);

// --------------------- URL NORMALIZATION ---------------------
// Fixes "Cannot GET //api/products" caused by double slashes in frontend requests
app.use((req, res, next) => {
  if (req.url.includes("//")) {
    req.url = req.url.replace(/\/{2,}/g, "/");
  }
  next();
});

// --------------------- JSON BODY PARSER (AFTER WEBHOOK) ---------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --------------------- ROUTES ---------------------
app.use(commonRouter);

// --------------------- DATABASE + START ---------------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});


// Global error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("SERVER ERROR STACK:", err);
  res.status(500).json({ 
    success: false, 
    message: err instanceof Error ? err.message : "Internal Server Error",
    error: err
  });
});

export default app;

// import * as dotenv from "dotenv";
// import { connectDB } from "./config/mongodb";
// export default app;

// import * as dotenv from "dotenv";
// import { connectDB } from "./config/mongodb";

// dotenv.config();

// import express from "express";
// import cors from "cors";  // <-- ADD THIS

// import webhookRoutes from "./routes/webhook.route";
// import adminRoutes from "./routes/admin.route";
// import productRoutes from "./routes/product.route";
// import authRoutes from "./routes/auth.route";
// import forgotRoutes from "./routes/forgot.route";
// import paymentRoutes from "./routes/payment.routes";

// import { authMiddleware } from "./middleware/auth";
// const app = express();
// const PORT = process.env.PORT || 3000;
// app.use(
//   "/webhooks",
//   webhookRoutes          // contains express.raw()
// );

// app.use(express.json());


// //  Allow all frontend origins (required for localhost & dev tunnels)
// app.use(cors({ origin: "*" }));
// app.use("/api", paymentRoutes);
// app.use("/webhooks", webhookRoutes);


// app.use("/auth", authRoutes);
// app.use("/auth", forgotRoutes);

// // raw body

// app.use("/admin", authMiddleware, adminRoutes);
// app.use("/api", authMiddleware, productRoutes);
//          // JSON parser
// // app.use("/admin", adminRoutes);      // admin routes
// // app.use("/api", productRoutes);     // product routes

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//   });
// });

// export default app;



// import * as dotenv from "dotenv";
// import { connectDB } from "./config/mongodb";
// dotenv.config();

// import express from "express";
// import webhookRoutes from "./routes/webhook.route";
// import adminRoutes from "./routes/admin.route";
// import productRoutes from "./routes/product.route";


// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use("/webhooks", webhookRoutes); // raw body
// app.use(express.json());            // now JSON parser
// app.use("/admin", adminRoutes);     // admin routes
// app.use("/api", productRoutes);

// // app.use(
// //   "/webhooks",
// //   webhookRoutes
// // );
// // app.use(express.json());
// // app.use(adminRoutes);

// /**
//  * Stripe webhook MUST receive raw body
//  * This middleware applies ONLY to /webhooks
//  */


// /**
//  * JSON body parser for all other routes
//  * (add these later when you create APIs)
//  */
// // app.use(express.json());
// // app.use("/api", apiRoutes);

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//   });
// });

// export default app;
// Touch comment to reload nodemon and read new email service updates.
