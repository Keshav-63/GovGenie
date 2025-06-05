import Document from "../models/user.document.model.js";
import bcrypt from "bcryptjs";
import {  cloudinary } from "../middleware/cloudinary.config.js";


export const uploadDocument = async (req, res) => {
  try {
    const { password } = req.body;
    const filename = req.body.filename || req.file.originalname;
    const userId = req.userId; 
    console.log("uploadDocument data", filename);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDocument = new Document({
      user: userId,
      filename,
      url: req.file.path,
      password: hashedPassword,
    });

    await newDocument.save();
    res.status(201).json({ message: "Document uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload document" });
  }
};


export const listUserDocuments = async (req, res) => {
  try {
    console.log("hhhhhhhhhhhhhhhhhh");
      const userId = req.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized - no user ID found" });
      }

      console.log(" debugging   dre.userId :", userId);
      const documents = await Document.find({ user: userId })
        .select("-password")
        .sort({ createdAt: -1 }); 
      res.json(documents);
    } catch (error) {
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
};


export const viewDocument = async (req, res) => {
  try {
      const { id, password } = req.body;
      console.log(" view doc ", password )
    const document = await Document.findById(id);
      console.log("fetch passwprd", document.password);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const isMatch = await bcrypt.compare(password, document.password);
      if (!isMatch) {
        console.log("password did not match")
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.json({ url: document.url });
  } catch (error) {
    res.status(500).json({ error: "Error accessing document" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    console.log(" delete data", id)
    const document = await Document.findOne({ _id: id, user: userId });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const publicId = document.url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await Document.findByIdAndDelete(id);

    res.json({ message: "Document deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
};
