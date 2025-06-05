import Agent from "../models/agent.model.js";

export const getAgentInfo = async (req, res) => {
  try {
    const { agentId } = req.params;
    const data = await Agent.findOne({ agentId });
    if (!data) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};
