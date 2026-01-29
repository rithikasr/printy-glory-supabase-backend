import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const getAllOrders = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      stripe_session_id,
      customer_email,
      total_amount,
      currency,
      payment_status,
      created_at,
      order_items (
        id,
        product_name,
        quantity,
        unit_price
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }

  res.json(data);
};
