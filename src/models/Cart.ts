import mongoose from "mongoose";

// Stores optional design customization info per cart item
const customizationSchema = new mongoose.Schema(
  {
    designImageUrl: { type: String, default: null },  // Cloudinary URL of captured design
    designElements: { type: [mongoose.Schema.Types.Mixed], default: [] }, // individual elements: [{type, content, x, y, width, height, ...}]
    productType: { type: String, default: null },      // 'phone-case' | 't-shirt'
    phoneModel: { type: String, default: null },       // e.g. 'iPhone 15 Pro Max'
    caseColor: { type: String, default: null },        // hex colour for phone case
    shirtType: { type: String, default: null },        // e.g. 'half-sleeve'
    shirtSize: { type: String, default: null },        // e.g. 'L'
    shirtColor: { type: String, default: null },       // hex colour for t-shirt
    hasCustomDesign: { type: Boolean, default: false },
    price: { type: Number, default: null }             // Snapshot of calculated price for custom items

  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
    customization: { type: customizationSchema, default: null }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    cartItems: [cartItemSchema],
    savedForLater: [cartItemSchema]
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
