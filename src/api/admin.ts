export const fetchOrders = async () => {
  const res = await fetch("http://localhost:3000/api/admin/orders");

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
};
