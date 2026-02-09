


import * as dotenv from "dotenv";
import { connectDB } from "./config/mongodb";
dotenv.config();

import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.route";
import productRoutes from "./routes/product.route";
import authRoutes from "./routes/auth.route";
import forgotRoutes from "./routes/forgot.route";
import paymentRoutes from "./routes/payment.routes";
import { stripeWebhookHandler } from "./controllers/payment.controller";

import { authMiddleware } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------- STRIPE WEBHOOK FIRST ----------------------
app.post(
  "/api/payment/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

// --------------------- JSON BODY PARSER (AFTER WEBHOOK) ---------------------
app.use(express.json());

// --------------------- CORS ---------------------
app.use(cors({ origin: "*" }));

// --------------------- ROUTES ---------------------
app.use("/api/payment", paymentRoutes);
app.use("/auth", authRoutes);
app.use("/auth", forgotRoutes);

app.use("/admin", authMiddleware, adminRoutes);
app.use("/api", authMiddleware, productRoutes);

// --------------------- DATABASE + START ---------------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export default app;

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
