import AgentInfo from "../models/agent.model.js";
import User from "../models/user.model.js";

export const registerAgent = async (req, res) => {
  try {
    console.log("Authenticated User:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      latitude,
      longitude,
      isIPV_Verified,
      ipvOtp,
      ipAddress,
      aboutUs
    } = req.body;


    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "File upload is required" });
    }

    const aadharCard = req.files.aadharCard
      ? req.files.aadharCard[0].path
      : null;
    const panCard = req.files.panCard ? req.files.panCard[0].path : null;
    const govCertificate = req.files.govCertificate
      ? req.files.govCertificate[0].path
      : null;
    const profilePhoto = req.files.profilePhoto
      ? req.files.profilePhoto[0].path
      : null;


    const newAgent = new AgentInfo({
      agentId: req.user.userId,
      firstName,
      lastName,
      phone,
      address,
      latitude,
      longitude,
      aadharCard,
      panCard,
      govCertificate,
      profilePhoto,
      isIPV_Verified,
      ipvOtp,
      ipAddress,
      aboutUs,
    });

    await newAgent.save();
    res
      .status(201)
      .json({ message: "Agent registered successfully", agent: newAgent });
  } catch (error) {
    console.error("Error in agent registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
