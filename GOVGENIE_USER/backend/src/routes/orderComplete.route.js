import express from "express";
import {
  markOrderAsCompleted,
  updatePaymentStatus,
} from "../controllers/orderComplete.controller.js";

const router = express.Router();


router.put("/complete/:orderId", markOrderAsCompleted);


router.put("/pay/:orderId", updatePaymentStatus);

export default router;
