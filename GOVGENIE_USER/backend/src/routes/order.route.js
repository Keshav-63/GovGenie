import express from "express";
import {
  handleBookService,
  verifyPayment,
  notificationVerifyPayment,
} from "../controllers/order.controller.js";
import Razorpay from "razorpay";

const router = express.Router();
// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
router.post("/book-service", handleBookService);
router.post("/verify-payment", verifyPayment);
router.post("/notification/verify-payment", notificationVerifyPayment);

router.post("/create-payment-order", async (req, res) => {
  const { orderId, amount } = req.body;

  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    console.log("Creating Razorpay order with options:", options);
    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
