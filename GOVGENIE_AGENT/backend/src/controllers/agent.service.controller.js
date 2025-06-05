import Agent from "../models/agent.model.js";


// Get all services of an agent

export const getAgentService = async (req, res) => {
  try {
    const { agentId } = req.params;

      const agent = await Agent.findOne({ agentId });
   
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    res.status(200).json(agent.services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};


// Add a service to an agent
export const addAgentService = async (req, res) => {
    try {
      const { agentId } = req.params;
      const newService = req.body;
      console.log("debbuging", newService);
      const agent = await Agent.findOne({ agentId });
      if (!agent) return res.status(404).json({ error: "Agent not found" });
      agent.services.push(newService);
      await agent.save();
      res
        .status(201)
        .json({ message: "Service added successfully", service: newService });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add service" });
    }
};


// Update a service for an agent

export const updateAgentService = async (req, res) => {

    try {
        const { agentId, serviceId } = req.params;
        const updatedService = req.body;

        const agent = await Agent.findOne({ agentId });
        if (!agent) return res.status(404).json({ error: "Agent not found" });

        const serviceIndex = agent.services.findIndex(
            (s) => s._id.toString() === serviceId
        );
        if (serviceIndex === -1)
            return res.status(404).json({ error: "Service not found" });

        agent.services[serviceIndex] = {
            ...agent.services[serviceIndex].toObject(),
            ...updatedService,
        };
        await agent.save();

        res.json({
            message: "Service updated successfully",
            service: agent.services[serviceIndex],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update service" });
    }
};


// Delete a service from an agent
export const deleteAgentService = async (req, res) => {
  try {
    const { agentId, serviceId } = req.params;
    const agent = await Agent.findOne({ agentId });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    const serviceToDelete = agent.services.find(
      (service) => service._id.toString() === serviceId
    );
    if (!serviceToDelete)
      return res.status(404).json({ error: "Service not found" });
    agent.services = agent.services.filter(
      (service) => service._id.toString() !== serviceId
    );
    await agent.save();
    res.json({
      message: "Service deleted successfully",
      deletedService: serviceToDelete,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete service" });
  }
};
