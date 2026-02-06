import { Request, Response } from "express";
import { Order } from "../models/Order";

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};



// import { Request, Response } from "express";
// import { Order } from "../models/Order";

// export const getAllOrders = async (_req: Request, res: Response) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };
