import express from "express";
import {
  uploadDocument,
  viewDocument,
  listUserDocuments,
  deleteDocument,
} from "../controllers/user.document.controller.js";
import uploads from "../middleware/cloudinary.config.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();


router.post("/upload",verifyToken, uploads.single("file"), uploadDocument);


router.get("/list",  verifyToken, listUserDocuments);


router.post("/view", verifyToken, viewDocument);

router.delete("/delete/:id", verifyToken, deleteDocument);

export default router;
