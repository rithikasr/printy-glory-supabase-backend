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
--------------------------------------------------- */
export const addToCart = async (req: any, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        cartItems: [{ product: productId, quantity }]
      });
    } else {
      const existingItem = cart.cartItems.find(
        item => item.product.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.cartItems.push({ product: productId, quantity });
      }

      await cart.save();
    }

    res.json({ success: true, message: "Added to cart", cart });

  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

/* ---------------------------------------------------
   MOVE TO SAVE FOR LATER
--------------------------------------------------- */
export const moveToSaveForLater = async (req: any, res: Response) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find item
    const item = cart.cartItems.find(
      item => item.product.toString() === productId
    );

    if (!item)
      return res.status(404).json({ message: "Product not in cart" });

    // Remove from cart
    cart.cartItems.pull({ product: productId });

    // Add to saved list
    cart.savedForLater.push({
      product: productId,
      quantity: item.quantity
    });

    await cart.save();

    res.json({
      success: true,
      message: "Moved to Save for Later",
      cart
    });

  } catch (error) {
    console.error("MOVE ERROR:", error);
    res.status(500).json({ message: "Failed to move item" });
  }
};



/* ---------------------------------------------------
   MOVE BACK TO CART
--------------------------------------------------- */
export const moveBackToCart = async (req: any, res: Response) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.savedForLater.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Product not in saved list" });

    const [item] = cart.savedForLater.splice(itemIndex, 1);
    cart.cartItems.push(item);

    await cart.save();

    res.json({ success: true, message: "Moved back to cart", cart });

  } catch (error) {
    res.status(500).json({ message: "Failed to move item" });
  }
};

/* ---------------------------------------------------
   REMOVE FROM CART
--------------------------------------------------- */
export const removeFromCart = async (req: any, res: Response) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Remove item with matching productId
    cart.cartItems.pull({ product: productId });

    await cart.save();

    res.json({
      success: true,
      message: "Removed from cart",
      cart
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

