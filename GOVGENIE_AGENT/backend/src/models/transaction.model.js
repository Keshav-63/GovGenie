import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentInfo",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "govgenie-user",
      default: null,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Failed", "Completed", "Pending"],
      default: "Pending",
    },
    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
