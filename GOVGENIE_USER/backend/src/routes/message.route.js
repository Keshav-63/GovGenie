
import express from "express";
import {
  getMessages,
  sendMessage,
  markAsSeen,
  getUnreadMessages,
} from "../controllers/message.controller.js";
import upload from "../middleware/cloudinary.config.js"; 

const router = express.Router();


router.get("/:userId/:agentId", getMessages);


router.post("/send", upload.single("file"), sendMessage);

router.put("/seen", markAsSeen);

router.get("/unread/:userId", getUnreadMessages);

export default router;
