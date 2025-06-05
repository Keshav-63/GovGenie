import express from "express";
import { findNearbyAgents } from "../controllers/agent.location.controller.js";

const router = express.Router();

router.get("/find-nearby-agents", findNearbyAgents);

export default router;
