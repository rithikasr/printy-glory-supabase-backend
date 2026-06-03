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

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { payment_status }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order" });
  }
};

export const requestOrderApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Support both file upload (req.file) and backward compatibility with URL (req.body)
    const approvalImage = req.file?.path || req.body.approvalImage;

    if (!approvalImage) {
      return res.status(400).json({ success: false, message: "Approval image is required" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        approvalImage,
        approvalStatus: "pending",
        status: "awaiting_approval",
        rejectionReason: ""
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Error requesting approval" });
  }
};
