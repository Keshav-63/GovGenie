import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentInfo",
      required: true,
    },
    service: { type: String, required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "govgenie-user",
      required: true,
    },
    orderDate: { type: Date, default: Date.now },
    orderStatus: {
      type: String,
      enum: ["In Progress", "Completed"],
      default: "In Progress",
    },
    amount: { type: Number, required: true },
    advance: { type: Number, required: true },
    dueDate: { type: Date, default: null },
    completedDate: { type: Date, default: null },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    finalPaymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
