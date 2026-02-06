import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: "inr" },
    image: { type: String }, // optional
    stock: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);