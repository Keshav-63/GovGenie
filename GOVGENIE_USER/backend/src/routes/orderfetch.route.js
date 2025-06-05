import express from "express";
import Order from "../models/order.model.js";
import mongoose from "mongoose";

const router = express.Router();


router.get("/orderdata/:orderId", async (req, res) => {
  try {
    const {orderId} = req.params; 
    console.log("orderrrr", orderId);
    const orders = await Order.findOne({
      _id: new mongoose.Types.ObjectId( orderId ),
    });
    console.log("ddddddd", orders);
    res.status(200).json({orders});
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ customer: userId }).sort({
      createdAt: -1,
    });

    const agentIds = orders.map((order) => order.agentId);

    const agentsCollection = mongoose.connection.db.collection("agentinfos");
    const agents = await agentsCollection
      .find({
        _id: { $in: agentIds.map((id) => new mongoose.Types.ObjectId(id)) }, 
      })
      .toArray();

  
    const ordersWithAgentDetails = orders.map((order) => {
      const agent = agents.find(
        (agent) => agent._id.toString() === order.agentId.toString()
      );
      return {
        ...order._doc, 
        agentName: agent ? `${agent.firstName}${agent.lastName}` : "Unknown",
        agentProfile: agent ? agent.profilePhoto : null,
      };
    });

    console.log("Fetched orders with agent details: ", ordersWithAgentDetails);

    res.status(200).json(ordersWithAgentDetails);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


router.get("/orders/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    console.log("request from frontend", agentId);
  
    if (!agentId || agentId === "null" || agentId === "undefined") {
      return res.status(400).json({ message: "Invalid agentId provided" });
    }
   
    const orders = await Order.find({ agentId: agentId })
      .sort({ createdAt: -1 })
      .populate("customer", "name"); 
    console.log("ordersssssssssssss", orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching agent orders:", error);
    res.status(500).json({ message: "Failed to fetch agent orders" });
  }
});


export default router;
