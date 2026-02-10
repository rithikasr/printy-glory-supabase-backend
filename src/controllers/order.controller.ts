import { Request, Response } from "express";
import { Order } from "../models/Order";

export const getMyOrders = async (req: any, res: Response) => {
  try {
    const email = req.user.email;

    const orders = await Order.find({ customer_email: email }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
