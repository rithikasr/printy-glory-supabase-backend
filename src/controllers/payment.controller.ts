import Stripe from "stripe";
import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Order } from "../models/Order";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    console.log('📦 Checkout request received:', {
      productId: req.body.productId,
      price: req.body.price,
      metadata: req.body.metadata
    });

    const { productId, price: customPrice, metadata: customMetadata } = req.body;

    if (!productId) {
      console.error('❌ No productId provided');
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.error('❌ Product not found:', productId);
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    console.log('✅ Product found:', product.name);

    // Use custom price if provided (for t-shirt types, etc.), otherwise use product price
    const finalPrice = customPrice || product.price;

    if (!finalPrice || finalPrice <= 0) {
      console.error('❌ Invalid price:', finalPrice);
      return res.status(400).json({
        success: false,
        message: "Invalid price"
      });
    }

    // Stripe requires a minimum amount (approx ₹50 for INR)
    if (finalPrice < 50) {
      console.error('❌ Price too low for Stripe:', finalPrice);
      return res.status(400).json({
        success: false,
        message: "Price must be at least ₹50.00 for online payments"
      });
    }

    console.log('💰 Final price:', finalPrice);

    // Build product name with customization details if provided
    let productName = product.name;
    if (customMetadata?.shirtType) {
      productName = `${product.name} - ${customMetadata.shirtType}`;
    }

    // Merge custom metadata with productId
    // Stripe metadata values must be strings and max 500 chars each
    const sessionMetadata: Record<string, string> = {
      productId: productId.toString()
    };

    // Add custom metadata, ensuring all values are strings
    if (customMetadata) {
      Object.keys(customMetadata).forEach(key => {
        const value = customMetadata[key];
        if (value !== undefined && value !== null) {
          sessionMetadata[key] = String(value).substring(0, 500); // Limit to 500 chars
        }
      });
    }

    console.log('📝 Session metadata:', sessionMetadata);

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return res.status(500).json({
        success: false,
        message: "Payment system not configured"
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: Math.round(finalPrice * 100), // Ensure it's an integer
            product_data: {
              name: productName,
              description: customMetadata?.size ? `Size: ${customMetadata.size}` : undefined
            },
          },
          quantity: 1,
        },
      ],
      metadata: sessionMetadata,

      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    console.log('✅ Stripe session created:', session.id);

    res.json({
      success: true,
      url: session.url
    });
  } catch (error: any) {
    console.error('❌ Checkout error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: "Stripe checkout failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
