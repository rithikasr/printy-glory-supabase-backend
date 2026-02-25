import Stripe from "stripe";
import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ─────────────────────────────────────────────────────────────────────────────
// Single-product checkout (used by PhoneCaseCustomizer / TShirtCustomizer "Buy Now")
// Body: { productId, price?, metadata? }
// ─────────────────────────────────────────────────────────────────────────────
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    console.log("📦 Checkout request received:", req.body);

    const { productId, price: customPrice, metadata: customMetadata } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const finalPrice = Number(customPrice) || Number(product.price);
    if (!finalPrice || finalPrice <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price" });
    }
    if (finalPrice < 50) {
      return res.status(400).json({ success: false, message: "Price must be at least ₹50.00" });
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
            currency: "inr",
            unit_amount: Math.round(finalPrice * 100),
            product_data: {
              name: productName,
              description: customMetadata?.size ? `Size: ${customMetadata.size}` : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: sessionMetadata,
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/success`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/cart`,
    });

    console.log("✅ Stripe session created:", session.id);
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

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of cartItems) {
      const price = Number(item.price);
      if (!price || price < 50) {
        console.warn(`⚠️  Skipping item ${item.productId} — invalid price (${price})`);
        continue;
      }

      // Build a human-readable product description from customization
      const c = item.customization;
      const descParts: string[] = [];
      if (c?.phoneModel) descParts.push(`Model: ${c.phoneModel}`);
      if (c?.caseColor) descParts.push(`Colour: ${c.caseColor}`);
      if (c?.shirtType) descParts.push(`Style: ${c.shirtType}`);
      if (c?.shirtSize) descParts.push(`Size: ${c.shirtSize}`);
      if (c?.shirtColor) descParts.push(`Colour: ${c.shirtColor}`);
      if (c?.hasCustomDesign) descParts.push("Custom design");

      const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: item.productName || "Custom Product",
        description: descParts.length ? descParts.join(" • ") : undefined,
      };

      // Add the design image as Stripe product image if available
      if (c?.designImageUrl) {
        productData.images = [c.designImageUrl];
      }

      lineItems.push({
        price_data: {
          currency: "inr",
          unit_amount: Math.round(price * 100),
          product_data: productData,
        },
        quantity: item.quantity || 1,
      });
    }

    if (lineItems.length === 0) {
      return res.status(400).json({ success: false, message: "No valid items to checkout" });
    }

    // Build Stripe metadata using individual per-item keys.
    // Stripe limit: 50 keys, each value max 500 chars.
    // Using item_N_* keys avoids the 500-char JSON truncation problem.
    const sessionMetadata: Record<string, string> = {
      source: "cart_checkout",
      item_count: String(cartItems.length),
    };

    cartItems.forEach((item, idx) => {
      const c = item.customization;
      sessionMetadata[`item_${idx}_pid`] = item.productId;
      if (c?.designImageUrl) sessionMetadata[`item_${idx}_design`] = c.designImageUrl.substring(0, 500);
      if (c?.phoneModel) sessionMetadata[`item_${idx}_phoneModel`] = c.phoneModel;
      if (c?.caseColor) sessionMetadata[`item_${idx}_caseColor`] = c.caseColor;
      if (c?.shirtType) sessionMetadata[`item_${idx}_shirtType`] = c.shirtType;
      if (c?.shirtSize) sessionMetadata[`item_${idx}_shirtSize`] = c.shirtSize;
      if (c?.shirtColor) sessionMetadata[`item_${idx}_shirtColor`] = c.shirtColor;
      if (c?.hasCustomDesign) sessionMetadata[`item_${idx}_customDesign`] = "true";
    });

    console.log("📝 Cart session metadata:", sessionMetadata);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: sessionMetadata,
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/success`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/cart`,
    });

    console.log("✅ Cart Stripe session created:", session.id);
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

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const metadata = session.metadata || {};

    console.log("🌟 Webhook received, session:", session.id);
    console.log("📝 Metadata source:", metadata.source || "buy_now");

    try {
      // Fetch Stripe line items (product name, qty, paid amount per item)
      const stripeLineItems = await stripe.checkout.sessions.listLineItems(session.id);

      let orderItems: any[];

      // ────────────────────────────────────────────────────────────────
      // CASE A: Cart checkout — metadata has source="cart_checkout"
      //         and per-item keys: item_N_pid, item_N_design, item_N_phoneModel, …
      // ────────────────────────────────────────────────────────────────
      if (metadata.source === "cart_checkout") {
        console.log("🛒 Handling cart checkout, items:", stripeLineItems.data.length);

        orderItems = stripeLineItems.data.map((stripeItem, idx) => {
          const pid = metadata[`item_${idx}_pid`] || null;
          const designUrl = metadata[`item_${idx}_design`] || null;
          const phoneModel = metadata[`item_${idx}_phoneModel`] || null;
          const caseColor = metadata[`item_${idx}_caseColor`] || null;
          const shirtType = metadata[`item_${idx}_shirtType`] || null;
          const shirtSize = metadata[`item_${idx}_shirtSize`] || null;
          const shirtColor = metadata[`item_${idx}_shirtColor`] || null;
          const isCustom = metadata[`item_${idx}_customDesign`] === "true";

          console.log(`  Item ${idx}: pid=${pid}, design=${designUrl?.substring(0, 60) || "none"}`);

          const customizationDetails: Record<string, any> = {};
          if (pid) customizationDetails.productId = pid;
          if (phoneModel) customizationDetails.phoneModel = phoneModel;
          if (caseColor) customizationDetails.caseColor = caseColor;
          if (shirtType) customizationDetails.shirtType = shirtType;
          if (shirtSize) customizationDetails.shirtSize = shirtSize;
          if (shirtColor) customizationDetails.shirtColor = shirtColor;
          if (isCustom) customizationDetails.isCustomDesign = true;

          return {
            product_name: stripeItem.description,
            quantity: stripeItem.quantity ?? 1,
            unit_price: (stripeItem.amount_total ?? 0) / 100,
            design_image: designUrl,
            customization_details: Object.keys(customizationDetails).length > 0
              ? customizationDetails
              : undefined,
          };
        });

        // Decrease stock for each product
        for (const [idx] of stripeLineItems.data.entries()) {
          const pid = metadata[`item_${idx}_pid`];
          if (pid) {
            await Product.findByIdAndUpdate(pid, { $inc: { stock: -1 } });
          }
        }
      }
      // ────────────────────────────────────────────────────────────────
      // CASE B: Single-product "Buy Now" from customizer
      //         metadata: { productId, designImage, phoneModel, caseColor, … }
      // ────────────────────────────────────────────────────────────────
      else {
        const {
          productId,
          designImage,
          design_image,
          phoneModel,
          caseColor,
          shirtType,
          size,
          color,
          customDesign,
        } = metadata;

        console.log("🎨 Handling Buy Now checkout for product:", productId);

        const designUrl = designImage || design_image || null;

        const customizationDetails: Record<string, any> = {};
        if (phoneModel) customizationDetails.phoneModel = phoneModel;
        if (caseColor) customizationDetails.caseColor = caseColor;
        if (shirtType) customizationDetails.shirtType = shirtType;
        if (size) customizationDetails.size = size;
        if (color) customizationDetails.color = color;
        if (customDesign === "true" || customDesign === true)
          customizationDetails.isCustomDesign = true;

        // Decrease stock
        if (productId) {
          await Product.findByIdAndUpdate(productId, { $inc: { stock: -1 } });
        }

        // Use line items for accurate names; fallback to product lookup
        if (stripeLineItems.data.length > 0) {
          orderItems = stripeLineItems.data.map((stripeItem) => ({
            product_name: stripeItem.description,
            quantity: stripeItem.quantity ?? 1,
            unit_price: (stripeItem.amount_total ?? 0) / 100,
            design_image: designUrl,
            customization_details: Object.keys(customizationDetails).length > 0
              ? customizationDetails
              : undefined,
          }));
        } else {
          // Fallback: try product name from DB
          const product = productId ? await Product.findById(productId) : null;
          orderItems = [{
            product_name: product?.name ?? "Custom Product",
            quantity: 1,
            unit_price: session.amount_total / 100,
            design_image: designUrl,
            customization_details: Object.keys(customizationDetails).length > 0
              ? customizationDetails
              : undefined,
          }];
        }
      }

      // Save the order
      await Order.create({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        total_amount: session.amount_total / 100,
        currency: session.currency,
        payment_status: session.payment_status,
        order_items: orderItems,
      });

      console.log(`✅ Order saved — ${orderItems.length} item(s), email: ${session.customer_details?.email}`);

    } catch (err) {
      console.error("❌ Failed to save order:", err);
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
