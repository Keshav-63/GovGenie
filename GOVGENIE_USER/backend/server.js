

import dotenv from "dotenv";
import express from "express";
import http from "http";
import socketServer from "./src/lib/socket.js";
import messageRoutes from "./src/routes/message.route.js";
import { connectDB } from "./src/db/connectDB.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
console.log("MongoDB URI:", process.env.MONGO_URI);

const io = socketServer(server);


app.use(express.json());
app.use("/api", messageRoutes);


server.listen(7000, () => {
  connectDB();
  console.log("WebSocket server running on port 7000");
});
