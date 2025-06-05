import express from "express";
import {
  getAgentService,
  addAgentService,
  updateAgentService,
  deleteAgentService,
} from "../controllers/agent.service.controller.js";

const router = express.Router();

router.get("/:agentId", getAgentService);
router.post("/:agentId", addAgentService);
router.put("/:agentId/:serviceId", updateAgentService);
router.delete("/:agentId/:serviceId", deleteAgentService);

export default router;

