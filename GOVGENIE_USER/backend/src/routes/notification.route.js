import express from "express";
import { User } from "../models/user.model.js"; 
import Order from "../models/order.model.js";

const router = express.Router();

router.post("/payment-request", async (req, res) => {
  try {
    const { orderId, customer, service, advance , agentId} = req.body;
    console.log("Received notification data:", req.body);
    if (!orderId || !customer || !service || !advance || !agentId) {
      return res
        .status(400)
        .json({ message: "Order ID and Customer ID are required." });
    }
    const user = await User.findById(customer);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.notification.push({
      message: `You have received a final payment request for order ${service} of 
      ₹ ${advance}.`,
      PaymentRequest: true,
        orderId: orderId,
        amount: advance,
      agentId: agentId,
    });
    await user.save();
    res
      .status(200)
      .json({ message: "Payment request notification sent successfully." });
  } catch (error) {
    console.error("Error sending payment request notification:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching notifications for user:", userId);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("User found for notification:", user);
    res.status(200).json({ notifications: user.notification });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
