import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import { Order } from "../models/Order";

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) return res.status(400).send("Missing stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_UQB9c1sy3HhhFGhpEuog6X8QqnlE1shg"
    );
  } catch (err: any) {
    console.error("❌ Invalid signature", err.message);
    return res.status(400).send("Invalid signature");
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const metadata = session.metadata || {};

    console.log("✅ Webhook: checkout.session.completed", session.id);
    console.log("📝 Metadata:", metadata);

    try {
      // Fetch the Stripe line items (gives us product names, qty, price)
      const stripeLineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      let orderItems: any[];

      // ── Cart checkout (Proceed to Checkout from Cart page) ──────────────────
      if (metadata.source === "cart_checkout") {
        // Metadata uses individual item_N_* keys — no JSON truncation risk.
        orderItems = stripeLineItems.data.map((stripeItem, idx) => {
          const pid = metadata[`item_${idx}_pid`] || null;
          const designUrl = metadata[`item_${idx}_design`] || null;
          const phoneModel = metadata[`item_${idx}_phoneModel`] || null;
          const caseColor = metadata[`item_${idx}_caseColor`] || null;
          const shirtType = metadata[`item_${idx}_shirtType`] || null;
          const shirtSize = metadata[`item_${idx}_shirtSize`] || null;
          const shirtColor = metadata[`item_${idx}_shirtColor`] || null;
          const isCustom = metadata[`item_${idx}_customDesign`] === "true";

          console.log(`📦 Cart item ${idx}: pid=${pid}, design=${designUrl?.substring(0, 60)}`);

          // Build customization_details exactly like the Buy Now flow does
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
            quantity: stripeItem.quantity,
            unit_price: (stripeItem.amount_total ?? 0) / 100,
            design_image: designUrl,
            customization_details: Object.keys(customizationDetails).length > 0
              ? customizationDetails
              : undefined,
          };
        });
      }
      // ── Single-product checkout ("Buy Now" from customizer) ─────────────────
      else {
        const {
          designImage,
          design_image,
          phoneModel,
          caseColor,
          shirtType,
          size,
          color,
          customDesign,
        } = metadata;

        const designUrl = designImage || design_image || null;

        const customizationDetails: any = {};
        if (phoneModel) customizationDetails.phoneModel = phoneModel;
        if (caseColor) customizationDetails.caseColor = caseColor;
        if (shirtType) customizationDetails.shirtType = shirtType;
        if (size) customizationDetails.size = size;
        if (color) customizationDetails.color = color;
        if (customDesign) customizationDetails.isCustomDesign = true;

        orderItems = stripeLineItems.data.map((stripeItem) => ({
          product_name: stripeItem.description,
          quantity: stripeItem.quantity,
          unit_price: (stripeItem.amount_total ?? 0) / 100,
          design_image: designUrl,
          customization_details:
            Object.keys(customizationDetails).length > 0
              ? customizationDetails
              : undefined,
        }));
      }

      await Order.create({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        total_amount: session.amount_total / 100,
        currency: session.currency,
        payment_status: session.payment_status,
        order_items: orderItems,
      });

      console.log(`✅ Order saved — ${orderItems.length} item(s)`);
    } catch (err) {
      console.error("❌ Failed to save order:", err);
    }
  }

  res.status(200).json({ received: true });
};

