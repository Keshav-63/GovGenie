import { create } from "hbs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    notification: {
      type: [
        {
          message: {
            type: String,
          },
          PaymentRequest: {
            type: Boolean,
            default: false,
          },
          orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
          },
          amount: {
            type: Number,
            default: null,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AgentInfo",
          },
        },
      ],
      default: [],
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("govgenie-user", userSchema);
