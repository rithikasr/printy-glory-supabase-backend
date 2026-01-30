import mongoose from "mongoose";
import orderItemSchema from "./OrderItem";

const orderSchema = new mongoose.Schema(
  {
    stripe_session_id: { type: String, required: true },
    customer_email: String,
    total_amount: Number,
    currency: String,
    payment_status: String,
    order_items: [orderItemSchema],
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
