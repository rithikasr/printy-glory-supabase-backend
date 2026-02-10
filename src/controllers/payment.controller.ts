import Stripe from "stripe";
import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Order } from "../models/Order";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: product.price * 100,
            product_data: { name: product.name },
          },
          quantity: 1,
        },
      ],
         metadata: {
        productId: productId,
      },

      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Stripe checkout failed" });
  }
};

// Webhook
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // -------- CHECKOUT SESSION COMPLETED -------- //
  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const productId = session.metadata.productId;

    console.log("🌟 Webhook received for product:", productId);

    if (productId) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -1 },
      });

      console.log("✅ Stock decreased for product:", productId);
    }
     try {
      const product = await Product.findById(productId);

      if (!product) {
        console.log("⚠️ Product not found during order save");
      } else {
        await Order.create({
          stripe_session_id: session.id,
          customer_email: session.customer_details.email,
          total_amount: session.amount_total / 100,
          currency: session.currency,
          payment_status: session.payment_status,
          order_items: [
            {
              product_name: product.name,
              quantity: 1,
              unit_price: product.price,
            },
          ],
        });

        console.log("🧾 Order saved successfully");
      }
    } catch (orderErr) {
      console.error("❌ Failed to save order:", orderErr);
    }
  }

  res.status(200).send("Webhook processed");
};
// export const stripeWebhookHandler = async (req: any, res: Response) => {
//   try {
//     const event = req.body;

//     if (event.type === "checkout.session.completed") {
//       const session: any = event.data.object;
//       const productId = session.metadata?.productId;

//       console.log("SESSION METADATA:", session.metadata);

//       // 1️ Reduce stock
//       if (productId) {
//         await Product.findByIdAndUpdate(productId, {
//           $inc: { stock: -1 },
//         });

//         console.log("Stock updated for product:", productId);
//       }
//     }
//     // if (event.type === "checkout.session.completed") {
//     //   const session = event.data.object;

//     //   // Update product stock here
//     //   // await Product.findByIdAndUpdate(session.metadata.productId, {
//     //   //   $inc: { stock: -1 }
//     //   // });

//     //   console.log("Checkout completed!");
//     // }

//     res.sendStatus(200);
//   } catch (error) {
//     console.error("Webhook error:", error);
//     res.sendStatus(400);
//   }
// };
