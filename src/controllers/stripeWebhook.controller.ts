import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import { supabase } from "../config/supabase";

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Missing stripe-signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // RAW body (important!)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  console.log("✅ Event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        total_amount: session.amount_total / 100,
        currency: session.currency,
        payment_status: session.payment_status,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Order insert failed:", error);
      return res.status(500).send("DB error");
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    for (const item of lineItems.data) {
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_name: item.description,
        quantity: item.quantity,
        unit_price: item.amount_total / 100,
      });
    }

    console.log("✅ Order + items saved");
  }

  res.status(200).json({ received: true });
};
