import express from "express";
import {
  getAgentById
} from "../controllers/agentDetails.controller.js";

const router = express.Router();

router.get("/:agentId", getAgentById);

export default router;
