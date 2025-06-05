import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/get-ip", async (req, res) => {
  try {
    const response = await axios.get("https://api64.ipify.org?format=json");
    res.json({ ip: response.data.ip });
  } catch (error) {
    console.error("Error fetching IP:", error);
    res.status(500).json({ message: "Failed to fetch IP address" });
  }
});

export default router;
