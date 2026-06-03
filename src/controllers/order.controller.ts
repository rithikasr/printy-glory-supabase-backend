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

export const approveOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndUpdate(
      { _id: id, customer_email: req.user.email },
      { approvalStatus: "approved", status: "processing" },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving order" });
  }
};

export const rejectOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Optional rejection reason

    const order = await Order.findOneAndUpdate(
      { _id: id, customer_email: req.user.email },
      { approvalStatus: "rejected", status: "rejected_by_customer", rejectionReason: reason },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting order" });
  }
};
