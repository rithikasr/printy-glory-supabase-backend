import Stripe from "stripe";
import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { PendingDesign } from "../models/PendingDesign";
import { Cart } from "../models/Cart";
import { sendOrderConfirmationEmail } from "../utils/emailService";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ─────────────────────────────────────────────────────────────────────────────
// Single-product checkout (used by PhoneCaseCustomizer / TShirtCustomizer "Buy Now")
// Body: { productId, price?, metadata? }
// ─────────────────────────────────────────────────────────────────────────────
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    console.log("📦 Checkout request received:", req.body);

    const { productId, price: customPrice, metadata: customMetadata, designElements } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const finalPriceINR = Number(customPrice) || Number(product.price);
    if (!finalPriceINR || finalPriceINR <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price" });
    }
    if (finalPriceINR < 50) {
      return res.status(400).json({ success: false, message: "Price must be at least ₹50.00" });
    }

    const reqCurrency = String(req.body.currency || "inr").toLowerCase();
    const isUSD = reqCurrency === "usd";
    const currency = isUSD ? "usd" : "inr";

    let unitAmount = Math.round(finalPriceINR * 100);
    if (isUSD) {
      unitAmount = Math.round((finalPriceINR / 80) * 100);
    }

    let productName = product.name;
    if (customMetadata?.shirtType) productName = `${product.name} - ${customMetadata.shirtType}`;

    // Build Stripe metadata (all values must be strings, max 500 chars)
    const sessionMetadata: Record<string, string> = { productId: productId.toString() };
    if (customMetadata) {
      Object.keys(customMetadata).forEach((key) => {
        const val = customMetadata[key];
        if (val !== undefined && val !== null) {
          sessionMetadata[key] = String(val).substring(0, 500);
        }
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: "Payment system not configured" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            unit_amount: unitAmount,
            product_data: {
              name: productName,
              description: customMetadata?.size ? `Size: ${customMetadata.size}` : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: sessionMetadata,
      success_url: `${process.env.FRONTEND_URL || "http://localhost:8080"}/success`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:8080"}/cart`,
    });

    console.log("✅ Stripe session created:", session.id);

    // Save design elements to a temp collection (too large for Stripe metadata)
    if (designElements && Array.isArray(designElements) && designElements.length > 0) {
      await PendingDesign.create({
        stripe_session_id: session.id,
        design_elements: designElements,
      });
      console.log(`📐 Saved ${designElements.length} design element(s) for session ${session.id}`);
    }

    res.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error("❌ Checkout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Stripe checkout failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Cart checkout (used by Cart page "Proceed to Checkout")
// Body: { cartItems: [{ productId, productName, price, quantity, customization? }] }
// ─────────────────────────────────────────────────────────────────────────────
export const createCartCheckoutSession = async (req: Request, res: Response) => {
  try {
    console.log("🛒 Cart checkout request received, items:", req.body.cartItems?.length);

    const { cartItems } = req.body as {
      cartItems: {
        productId: string;
        productName: string;
        price: number;
        quantity: number;
        customization?: {
          designImageUrl?: string;
          designElements?: any[];
          productType?: string;
          phoneModel?: string;
          caseColor?: string;
          shirtType?: string;
          shirtSize?: string;
          shirtColor?: string;
          hasCustomDesign?: boolean;
        } | null;
      }[];
    };

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: "Payment system not configured" });
    }

    const reqCurrency = String(req.body.currency || "inr").toLowerCase();
    const isUSD = reqCurrency === "usd";
    const currency = isUSD ? "usd" : "inr";

    // Build Stripe line items and metadata simultaneously to ensure index alignment
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const sessionMetadata: Record<string, string> = {
      source: "cart_checkout",
      userId: (req as any).user?.id || "",
    };
    const allDesignElements: any[] = [];
    let validItemCount = 0;

    for (const item of cartItems) {
      const priceINR = Number(item.price);
      if (!priceINR || priceINR < 50) {
        console.warn(`⚠️ Skipping item ${item.productId} — invalid price (${priceINR})`);
        continue;
      }

      let unitAmount = Math.round(priceINR * 100);
      if (isUSD) {
        unitAmount = Math.round((priceINR / 80) * 100);
      }

      // 1. Build line item
      const c = item.customization;
      const descParts: string[] = [];
      if (c?.phoneModel) descParts.push(`Model: ${c.phoneModel}`);
      if (c?.caseColor) descParts.push(`Colour: ${c.caseColor}`);
      if (c?.shirtType) descParts.push(`Style: ${c.shirtType}`);
      if (c?.shirtSize) descParts.push(`Size: ${c.shirtSize}`);
      if (c?.shirtColor) descParts.push(`Colour: ${c.shirtColor}`);
      if (c?.hasCustomDesign) descParts.push("Custom design");

      lineItems.push({
        price_data: {
          currency: currency,
          unit_amount: unitAmount,
          product_data: {
            name: item.productName || "Custom Product",
            description: descParts.length ? descParts.join(" • ") : undefined,
            images: c?.designImageUrl ? [c.designImageUrl] : undefined,
          },
        },
        quantity: item.quantity || 1,
      });

      // 2. Build metadata for THIS valid item
      const idx = validItemCount;
      sessionMetadata[`item_${idx}_pid`] = item.productId;
      if (c?.designImageUrl) sessionMetadata[`item_${idx}_design`] = c.designImageUrl.substring(0, 500);
      if (c?.phoneModel) sessionMetadata[`item_${idx}_phoneModel`] = c.phoneModel;
      if (c?.caseColor) sessionMetadata[`item_${idx}_caseColor`] = c.caseColor;
      if (c?.shirtType) sessionMetadata[`item_${idx}_shirtType`] = c.shirtType;
      if (c?.shirtSize) sessionMetadata[`item_${idx}_shirtSize`] = c.shirtSize;
      if (c?.shirtColor) sessionMetadata[`item_${idx}_shirtColor`] = c.shirtColor;
      if (c?.hasCustomDesign) sessionMetadata[`item_${idx}_customDesign`] = "true";

      // 3. Collect design elements for THIS valid item
      if (c?.designElements && Array.isArray(c.designElements) && c.designElements.length > 0) {
        allDesignElements.push({ itemIndex: idx, elements: c.designElements });
      }

      validItemCount++;
    }

    if (lineItems.length === 0) {
      return res.status(400).json({ success: false, message: "No valid items to checkout" });
    }

    sessionMetadata.item_count = String(validItemCount);
    console.log(`📝 Cart session metadata for ${validItemCount} items:`, sessionMetadata);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: sessionMetadata,
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/success`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/cart`,
    });

    console.log("✅ Cart Stripe session created:", session.id);

    if (allDesignElements.length > 0) {
      await PendingDesign.create({
        stripe_session_id: session.id,
        design_elements: allDesignElements,
      });
      console.log(`📐 Saved designs for ${allDesignElements.length} item(s), session ${session.id}`);
    }

    res.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error("❌ Cart checkout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Stripe checkout failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Webhook — handles BOTH "Buy Now" (single product) and "Proceed to Checkout" (cart)
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  const bodySize = req.body ? Math.round(req.body.length / 1024) : 0;
  console.log(`📥 Incoming Webhook Request — Size: ${bodySize} KB`);

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is NOT set!");
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified. Type:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const metadata = session.metadata || {};

    console.log("🌟 Processing Session:", session.id);
    console.log("📝 Source:", metadata.source || "buy_now");
    console.log("📝 UserID:", metadata.userId || "N/A");

    try {
      const stripeLineItems = await stripe.checkout.sessions.listLineItems(session.id);
      let orderItems: any[] = [];

      // CASE A: Cart Checkout
      if (metadata.source === "cart_checkout") {
        console.log("🛒 Processing cart checkout items:", stripeLineItems.data.length);
        orderItems = stripeLineItems.data.map((stripeItem, idx) => {
          const pid = metadata[`item_${idx}_pid`];
          const customizationDetails: any = {};
          if (pid) customizationDetails.productId = pid;
          if (metadata[`item_${idx}_phoneModel`]) customizationDetails.phoneModel = metadata[`item_${idx}_phoneModel`];
          if (metadata[`item_${idx}_caseColor`]) customizationDetails.caseColor = metadata[`item_${idx}_caseColor`];
          if (metadata[`item_${idx}_shirtType`]) customizationDetails.shirtType = metadata[`item_${idx}_shirtType`];
          if (metadata[`item_${idx}_shirtSize`]) customizationDetails.shirtSize = metadata[`item_${idx}_shirtSize`];
          if (metadata[`item_${idx}_shirtColor`]) customizationDetails.shirtColor = metadata[`item_${idx}_shirtColor`];
          if (metadata[`item_${idx}_customDesign`] === "true") customizationDetails.isCustomDesign = true;

          return {
            product_name: stripeItem.description,
            quantity: stripeItem.quantity ?? 1,
            unit_price: (stripeItem.amount_total ?? 0) / 100,
            design_image: metadata[`item_${idx}_design`] || null,
            customization_details: Object.keys(customizationDetails).length > 0 ? customizationDetails : undefined,
          };
        });

        // Stock update
        for (const [idx] of stripeLineItems.data.entries()) {
          const pid = metadata[`item_${idx}_pid`];
          if (pid) await Product.findByIdAndUpdate(pid, { $inc: { stock: -1 } });
        }
      }
      // CASE B: Buy Now
      else {
        const productId = metadata.productId;
        console.log("🎨 Processing Buy Now for product:", productId);

        const customizationDetails: any = {};
        if (metadata.phoneModel) customizationDetails.phoneModel = metadata.phoneModel;
        if (metadata.caseColor) customizationDetails.caseColor = metadata.caseColor;
        if (metadata.shirtType) customizationDetails.shirtType = metadata.shirtType;
        if (metadata.size) customizationDetails.size = metadata.size;
        if (metadata.color) customizationDetails.color = metadata.color;
        if (metadata.customDesign === "true" || metadata.customDesign === true) customizationDetails.isCustomDesign = true;

        if (productId) {
          await Product.findByIdAndUpdate(productId, { $inc: { stock: -1 } });
        }

        const designUrl = metadata.designImage || metadata.design_image || null;

        orderItems = stripeLineItems.data.map(item => ({
          product_name: item.description,
          quantity: item.quantity ?? 1,
          unit_price: (item.amount_total ?? 0) / 100,
          design_image: designUrl,
          customization_details: Object.keys(customizationDetails).length > 0 ? customizationDetails : undefined,
        }));
      }

      // Attach design elements
      const pendingDesign = await PendingDesign.findOne({ stripe_session_id: session.id });
      if (pendingDesign) {
        console.log("📐 Found pending design elements");
        if (metadata.source === "cart_checkout") {
          for (const entry of pendingDesign.design_elements as any[]) {
            if (orderItems[entry.itemIndex]) orderItems[entry.itemIndex].design_elements = entry.elements;
          }
        } else if (orderItems.length > 0) {
          orderItems[0].design_elements = pendingDesign.design_elements;
        }
        await PendingDesign.deleteOne({ _id: pendingDesign._id });
      }

      // Create Order
      const newOrder = await Order.create({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        total_amount: session.amount_total / 100,
        currency: session.currency,
        payment_status: session.payment_status,
        order_items: orderItems,
      });
      console.log("✅ Order created ID:", newOrder._id);

      // Send Email
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        try {
          console.log(`📧 Sending order confirmation email to: ${customerEmail}`);
          await sendOrderConfirmationEmail({
            email: customerEmail,
            orderId: newOrder._id.toString().slice(-8).toUpperCase(),
            productName: orderItems.map((i: any) => i.product_name).join(", "),
            totalAmount: session.amount_total,
            currency: session.currency,
            designPreview: orderItems[0]?.design_image,
            shippingDetails: session.shipping_details || session.customer_details,
          });
          console.log("✅ Email sent successfully");
        } catch (emailErr: any) {
          console.error("❌ Email failed:", emailErr.message);
        }
      }

      // Clear Cart
      if (metadata.source === "cart_checkout" && metadata.userId) {
        console.log(`🧹 Clearing cart for user: ${metadata.userId}`);
        const cartClear = await Cart.findOneAndUpdate(
          { user: metadata.userId },
          { $set: { cartItems: [] } }
        );
        if (cartClear) console.log("✅ Cart cleared");
        else console.warn("⚠️ Cart not found for user ID to clear");
      }

    } catch (err: any) {
      console.error("❌ Webhook internal processing error:", err.message);
      console.error(err);
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
