import express from "express";
import { getAgentInfo } from "../controllers/agentinfo.controller.js";

const router = express.Router();

router.get("/agentinfo-schema/:agentId", getAgentInfo);

export default router;
