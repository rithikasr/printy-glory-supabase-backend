import express from "express";
import { stripe } from "../config/stripe";
import { Product } from "../models/Product";

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: product.name },
            unit_amount: product.price * 100,
          },
          quantity: 1,
        },
      ],

      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",

      metadata: {
        productId: product._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Stripe session failed" });
  }
});

export default router;
