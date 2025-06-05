
import Chat from "../models/message.model.js";
import Order from "../models/order.model.js";
import { encryptMessage, decryptMessage } from "../utils/encryption.js";
import { cloudinary } from "../middleware/cloudinary.config.js";


export const getMessages = async (req, res) => {
  try {
    const { userId, agentId } = req.params;

  
    const order = await Order.findOne({ userId, agentId });
    if (!order) {
      return res.status(403).json({ error: "Unauthorized chat access" });
    }

    const messages = await Chat.find({
      $or: [
        { senderId: userId, receiverId: agentId },
        { senderId: agentId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    const decryptedMessages = messages.map((msg) => ({
      ...msg._doc,
      text: decryptMessage(msg.text),
    }));


    await Chat.updateMany(
      { receiverId: userId, status: "sent" },
      { status: "delivered" }
    );

    res.status(200).json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    let fileUrl = "";


    const order = await Order.findOne({
      $or: [
        { userId: senderId, agentId: receiverId },
        { userId: receiverId, agentId: senderId },
      ],
    });

    if (!order) {
      return res.status(403).json({ error: "Unauthorized message sending" });
    }

  
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      fileUrl = result.secure_url;
    }

   
    const encryptedText = text ? encryptMessage(text) : "";

  
    const newMessage = new Chat({
      senderId,
      receiverId,
      text: encryptedText,
      fileUrl,
      status: "sent",
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { messageId } = req.body;
    await Chat.updateOne({ _id: messageId }, { status: "seen" });
    res.status(200).json({ message: "Message marked as seen" });
  } catch (error) {
    res.status(500).json({ error: "Error marking message as seen" });
  }
};


export const getUnreadMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const unreadCount = await Chat.countDocuments({
      receiverId: userId,
      status: "sent",
    });
    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: "Error fetching unread messages" });
  }
};
