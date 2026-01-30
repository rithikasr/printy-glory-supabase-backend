import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import { Order } from "../models/Order";

export const stripeWebhookHandler = async (req: Request, res: Response) => {
    console.log(req.body)
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
    console.log("EVENT DATA:", event.data.object);

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    const orderItems = lineItems.data.map((item) => ({
      product_name: item.description,
      quantity: item.quantity,
      unit_price: item.amount_total! / 100,
    }));

    try {
  await Order.create({
    stripe_session_id: session.id,
    customer_email: session.customer_details?.email,
    total_amount: session.amount_total / 100,
    currency: session.currency,
    payment_status: session.payment_status,
    order_items: orderItems,
  });

  console.log("✅ Order saved to MongoDB");
} catch (err) {
  console.error("❌ MongoDB save failed:", err);
}

    // await Order.create({
    //   stripe_session_id: session.id,
    //   customer_email: session.customer_details?.email,
    //   total_amount: session.amount_total / 100,
    //   currency: session.currency,
    //   payment_status: session.payment_status,
    //   order_items: orderItems,
    // });

    // console.log("✅ Order saved to MongoDB");
  }

  res.status(200).json({ received: true });
};
