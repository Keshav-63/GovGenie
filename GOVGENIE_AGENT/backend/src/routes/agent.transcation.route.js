import express from "express";
const router = express.Router();
import {
  getTransactionById,
  createTransaction,
}  from "../controllers/agent.transaction.controller.js";


router.get("/agent/:id", getTransactionById);


router.post("/newagent", createTransaction);

export default router;
