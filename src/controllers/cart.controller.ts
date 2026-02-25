import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";

/* ---------------------------------------------------
   GET USER CART
--------------------------------------------------- */
export const getUserCart = async (req: any, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("cartItems.product")
      .populate("savedForLater.product");

    return res.json(cart || { cartItems: [], savedForLater: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to load cart" });
  }
};

/* ---------------------------------------------------
   ADD TO CART
   Body: { productId, quantity?, customization? }
   customization: {
     designImageUrl, productType,
     phoneModel, caseColor,
     shirtType, shirtSize, shirtColor,
     hasCustomDesign
   }
--------------------------------------------------- */
export const addToCart = async (req: any, res: Response) => {
  try {
    const { productId, quantity = 1, customization = null } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    const newItem = {
      product: productId,
      quantity,
      customization: customization || null
    };

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        cartItems: [newItem]
      });
    } else {
      // If this is a customized item, always add as a new line (each design is unique)
      // If not customized, merge with existing item of same product
      if (customization?.hasCustomDesign) {
        cart.cartItems.push(newItem as any);
      } else {
        const existingItem = cart.cartItems.find(
          item => item.product.toString() === productId && !item.customization?.hasCustomDesign
        );
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.cartItems.push(newItem as any);
        }
      }
      await cart.save();
    }

    res.json({ success: true, message: "Added to cart", cart });

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

/* ---------------------------------------------------
   MOVE TO SAVE FOR LATER
   Body: { productId, itemIndex? }
   itemIndex is used when multiple cart lines exist for same productId (customized items)
--------------------------------------------------- */
export const moveToSaveForLater = async (req: any, res: Response) => {
  try {
    const { productId, itemIndex } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find item — if itemIndex provided use it, otherwise find first match
    let idx: number;
    if (typeof itemIndex === "number") {
      idx = itemIndex;
    } else {
      idx = cart.cartItems.findIndex(
        item => item.product.toString() === productId
      );
    }

    if (idx === -1 || idx >= cart.cartItems.length)
      return res.status(404).json({ message: "Product not in cart" });

    const [item] = cart.cartItems.splice(idx, 1);

    // Carry customization over to savedForLater
    cart.savedForLater.push(item);

    await cart.save();

    res.json({
      success: true,
      message: "Moved to Save for Later",
      cart
    });

  } catch (error) {
    console.error("MOVE TO SAVE ERROR:", error);
    res.status(500).json({ message: "Failed to move item" });
  }
};

/* ---------------------------------------------------
   MOVE BACK TO CART
   Body: { productId, itemIndex? }
--------------------------------------------------- */
export const moveBackToCart = async (req: any, res: Response) => {
  try {
    const { productId, itemIndex } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    let idx: number;
    if (typeof itemIndex === "number") {
      idx = itemIndex;
    } else {
      idx = cart.savedForLater.findIndex(
        item => item.product.toString() === productId
      );
    }

    if (idx === -1 || idx >= cart.savedForLater.length)
      return res.status(404).json({ message: "Product not in saved list" });

    const [item] = cart.savedForLater.splice(idx, 1);

    // Carry customization back to cartItems
    cart.cartItems.push(item);

    await cart.save();

    res.json({ success: true, message: "Moved back to cart", cart });

  } catch (error) {
    console.error("MOVE BACK ERROR:", error);
    res.status(500).json({ message: "Failed to move item" });
  }
};

/* ---------------------------------------------------
   REMOVE FROM CART
   Body: { productId, itemIndex? }
--------------------------------------------------- */
export const removeFromCart = async (req: any, res: Response) => {
  try {
    const { productId, itemIndex } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (typeof itemIndex === "number") {
      cart.cartItems.splice(itemIndex, 1);
    } else {
      const idx = cart.cartItems.findIndex(
        item => item.product.toString() === productId
      );
      if (idx !== -1) cart.cartItems.splice(idx, 1);
    }

    await cart.save();

    res.json({
      success: true,
      message: "Removed from cart",
      cart
    });

  } catch (error) {
    console.error("REMOVE ERROR:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

/* ---------------------------------------------------
   REMOVE FROM SAVED FOR LATER
   Body: { productId, itemIndex? }
--------------------------------------------------- */
export const removeFromSavedForLater = async (req: any, res: Response) => {
  try {
    const { productId, itemIndex } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (typeof itemIndex === "number") {
      cart.savedForLater.splice(itemIndex, 1);
    } else {
      const idx = cart.savedForLater.findIndex(
        item => item.product.toString() === productId
      );
      if (idx !== -1) cart.savedForLater.splice(idx, 1);
    }

    await cart.save();

    res.json({ success: true, message: "Removed from saved list", cart });

  } catch (error) {
    console.error("REMOVE SAVED ERROR:", error);
    res.status(500).json({ message: "Failed to remove item from saved list" });
  }
};
