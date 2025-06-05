import mongoose from "mongoose";


export const getAgentById = async (req, res) => {
  try {
    const agentsCollection = mongoose.connection.db.collection("agentinfos");
    const agent = await agentsCollection.findOne({
      _id: new mongoose.Types.ObjectId(req.params.agentId),
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.status(200).json({ agent });
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({ message: "Server error" });
  }
};
