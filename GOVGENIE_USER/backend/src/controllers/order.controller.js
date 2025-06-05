import Order from "../models/order.model.js";
import Transaction from "../models/transaction.model.js";
import { User } from "../models/user.model.js"; 
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const handleBookService = async (req, res) => {
  try {
    const { agentId, customer, service, amount, dueDate } = req.body;
    console.log("Order data received:", req.body);

    
    if (!agentId || !customer || !service || !amount || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    const advanceAmount = amount * 0.5; 
    const platformFee = amount * 0.05;
    const totalAmount = advanceAmount + platformFee; 

    console.log("Advance Amount:", advanceAmount);
    console.log("Platform Fee:", platformFee);
    console.log("Total Amount (in INR):", totalAmount);

   
    const totalAmountInPaisa = Math.round(totalAmount * 100);

   
    const options = {
      amount: totalAmountInPaisa, 
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created:", order);

    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount / 100, 
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error in handleBookService:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      order_id,
      payment_id,
      razorpay_signature,
      agentId,
      customer,
      service,
      amount,
      advance,
      dueDate,
    } = req.body;

    console.log("verify payment...", req.body);

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

   
    const newOrder = await Order.create({
      agentId,
      customer,
      service,
      amount,
      advance,
      dueDate,
      paymentStatus: "Paid",
    });

 
    await Transaction.create({
      orderId: newOrder._id,
      agentId,
      customer,
      amount: advance,
      type: "Credit",
      status: "Completed",
    });

    const agentsCollection = mongoose.connection.db.collection("agentinfos");
    const agent = await agentsCollection.findOne({
      _id: new mongoose.Types.ObjectId(agentId),
    });
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }


    await agentsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(agentId) },
      {
        $inc: { total_earning: advance, avaiable_balance: advance },
      }
    );

    console.log("Updated Agent Balances:", {
      totalBalance: agent.total_earning + amount,
      availableBalance: agent.avaiable_balance + amount,
    });

    res.json({ success: true, message: "Payment verified and order created" });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const notificationVerifyPayment = async (req, res) => {
  const { orderId, order_Id, paymentId, razorpaySignature, agentId, customer, amount } =
    req.body;

  console.log("Notification data received:", req.body);

  try {

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    console.log("Generated signature:", generated_signature);

    if (generated_signature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findOne({ _id: order_Id }); 
    console.log("Order data:", order);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

   
    order.finalPaymentStatus = "Paid";
    await order.save();

   
    const transaction = new Transaction({
      orderId: order._id, 
      agentId,
      customer,
      amount,
      type: "Credit",
      status: "Completed",
    });
    console.log("Transaction data:", transaction);
    await transaction.save();


    const agentsCollection = mongoose.connection.db.collection("agentinfos");
    const agent = await agentsCollection.findOne({
      _id: new mongoose.Types.ObjectId(agentId),
    });
    console.log("Agent data:", agent);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    await agentsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(agentId) },
      {
        $inc: { total_earning: amount, avaiable_balance: amount },
      }
    );

    console.log("Updated Agent Balances:", {
      totalBalance: agent.total_earning + amount,
      availableBalance: agent.avaiable_balance + amount,
    });
    await User.updateOne(
      { _id: customer, "notification.orderId": order_Id },
      { $set: { "notification.$.PaymentRequest": false } }
    );
   
    res.status(200).json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};