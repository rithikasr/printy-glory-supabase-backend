import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_name: String,
    quantity: Number,
    unit_price: Number,
  },
  { _id: false }
);

export default orderItemSchema;
