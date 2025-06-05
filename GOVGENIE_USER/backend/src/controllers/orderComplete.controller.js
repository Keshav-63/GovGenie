import Order from "../models/order.model.js";


export const markOrderAsCompleted = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = "Completed";
    order.completedDate = new Date();
    order.finalPaymentStatus = "Pending";

    await order.save();

    res.status(200).json({ message: "Order marked as completed", order });
  } catch (error) {
    console.error("Error marking order as completed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.finalPaymentStatus = "Paid";

    await order.save();

    res.status(200).json({ message: "Payment status updated to Paid", order });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
