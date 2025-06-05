import express from "express";
import mongoose from "mongoose";
import Agent from "../models/agent.model.js";
const router = express.Router();


router.get("/:userId", async (req, res) => {
  try {
    console.log("inside order route", req.params);
    const { userId } = req.params;
    const agent = await Agent.findOne({ agentId: userId });

    const ordersCollection = mongoose.connection.db.collection("orders");
    console.log("inside order route agent info", agent);
    const orders = await ordersCollection
      .find({ agentId: new mongoose.Types.ObjectId(agent._id) })
      .sort({ createdAt: -1 })
      .toArray();

    console.log("inside order route", orders);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const userIds = [...new Set(orders.map((order) => order.customer))];

    const usersCollection = mongoose.connection.db.collection("govgenie-users");
    const users = await usersCollection
      .find({
        _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) }, 
      })
      .toArray();

    console.log("userrrdetails", users);
    const ordersWithUserDetails = orders.map((order) => {
      const user = users.find(
        (user) => user._id.toString() === order.customer.toString()
      );
      return {
        ...order, 
        userName: user ? `${user.name}` : "Unknown",
        userEmail: user ? user.email : "Unknown",
      };
    });

    console.log("Fetched orders with user details: ", ordersWithUserDetails);

    res.status(200).json(ordersWithUserDetails);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
});

export default router;
