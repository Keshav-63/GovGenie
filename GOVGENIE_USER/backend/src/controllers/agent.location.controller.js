
import mongoose from "mongoose";


const toRadians = (degrees) => degrees * (Math.PI / 180);


const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


export const findNearbyAgents = async (req, res) => {
  try {
    console.log("find nearby agent ", req.query);
    const { latitude, longitude, radius } = req.query;
      console.log("user dist", radius);
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const maxDistance = radius ? Number(radius) : 50000; 

   
    const agentsCollection = mongoose.connection.db.collection("agentinfos");
    const agents = await agentsCollection.find({}).toArray();

    console.log("Fetched Agents:", agents);


    const nearbyAgents = agents
      .map((agent) => {
      
        const distance = getDistance(
          Number(latitude),
          Number(longitude),
          Number(agent.latitude),
          Number(agent.longitude)
        );

        console.log(
          `Agent: ${agent.firstName} ${agent.lastName}, Distance: ${distance} km`
        );

        return { ...agent, distance };
      })
      .filter((agent) => agent.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    console.log("Nearby Agents:", nearbyAgents);

    res.json({ success: true, agents: nearbyAgents });
  } catch (error) {
    console.error("Error fetching nearby agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
