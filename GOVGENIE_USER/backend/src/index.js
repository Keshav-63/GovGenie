import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import userDocument from "./routes/user.document.route.js";
import locationfetch from "./routes/locationfetch.route.js";
import agentDetails from "./routes/agentDetails.route.js";
import orderRoutes from "./routes/order.route.js";
import orderFetch from "./routes/orderfetch.route.js";
import Genie from "./routes/genie.route.js"
import orderComplete from "./routes/orderComplete.route.js";
import notificationRoutes from "./routes/notification.route.js";
import earningRoutes from "./routes/agentEarning.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(cors({ origin: ["http://localhost:3001", "http://localhost:5173", ], credentials: true }));
app.use(express.json()); 
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/doc", userDocument);
app.use("/api/location", locationfetch);
app.use("/api/agents", agentDetails);
app.use("/api/orders", orderRoutes);
app.use("/api/user/", orderFetch);
app.use("/api/genie", Genie);
app.use("/api/ordercomplete", orderComplete);
app.use("/api/notifications", notificationRoutes);
app.use("/api/earnings", earningRoutes);

http: app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);
});