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
    status: { type: String, default: "processing" },
    approvalStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    approvalImage: String, // Mockup image sent by admin for user approval
    rejectionReason: String, // Comments from customer if rejected
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
