import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.model.js";

const router = express.Router();

router.get("/:agentId", async (req, res) => {
  const { agentId } = req.params;
  const { period } = req.query;
  console.log("period", agentId);

  try {
    
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: "Invalid agentId" });
    }

    const matchStage = { agentId: new mongoose.Types.ObjectId(agentId) };
    const groupStage = {};

    if (period === "day") {
      groupStage._id = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
    } else if (period === "week") {
      groupStage._id = { $isoWeek: "$createdAt" };
    } else if (period === "month") {
      groupStage._id = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
    } else {
      return res
        .status(400)
        .json({ message: "Invalid period. Use 'day', 'week', or 'month'." });
    }

    groupStage.totalEarnings = { $sum: "$amount" };
    console.log("groupStage", groupStage);

    const orders = await Order.find({
      agentId: agentId,
    });
    console.log("Orders for agent:", orders);

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this agent." });
    }

    const earnings = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);
    console.log("Earnings:", earnings);

    res.status(200).json(earnings);
  } catch (error) {
    console.error("Error fetching earnings data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
