import Transaction from "../models/transaction.model.js";
import mongoose from "mongoose";


export const getTransactionById = async (req, res) => {
    try {
        console.log(" agent Id.. ", req.params)
        const agent = req.params;
        const agentTransaction =
            mongoose.connection.db.collection("transactions");
        const transaction = await agentTransaction.find({
            agentId: new mongoose.Types.ObjectId(req.params),
        }).toArray();

        console.log("transaction", transaction);
        if (!transaction)
            return res.status(404).json({ message: "Transaction not found" });
      
        res.status(200).json({transaction});
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction", error });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { agentId, amount } = req.body; 
    console.log("data...", agentId);
    console.log("data...", amount);
    if (!agentId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid transaction details" });
    }
      const AgentId = agentId;
    
    const agentCollection = mongoose.connection.db.collection("agentinfos");
    const transactionCollection =
      mongoose.connection.db.collection("transactions");
   
    if (!mongoose.isValidObjectId(agentId)) {
      return res.status(400).json({ message: "Invalid agentId format" });
    }
   
    const agent = await agentCollection.findOne({
      agentId: new mongoose.Types.ObjectId(AgentId),
    });
    console.log("agentttt", agent);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const updatebalance = await agentCollection.updateOne(
      { agentId: new mongoose.Types.ObjectId(AgentId) },
      {
        $inc: {
          avaiable_balance: -amount,
        },
      } 
    );
    console.log("update balance data", updatebalance);

    // Create transaction record
    const transaction = {
      agentId: new mongoose.Types.ObjectId(agent._id),
      amount: amount,
      type: "Debit",
      status: "Completed",
      transactionDate: new Date(),
    };

    const savedTransaction = await transactionCollection.insertOne(transaction);

    res.status(201).json({
      savedTransaction,
    });
  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ message: "Error creating transaction", error });
  }
};

