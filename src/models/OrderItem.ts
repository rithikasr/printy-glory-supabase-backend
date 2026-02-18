import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_name: String,
    quantity: Number,
    unit_price: Number,
    design_image: String, // URL of the uploaded design
    customization_details: mongoose.Schema.Types.Mixed, // flexible object for phone model, color, etc.
  },
  { _id: false }
);

export default orderItemSchema;
