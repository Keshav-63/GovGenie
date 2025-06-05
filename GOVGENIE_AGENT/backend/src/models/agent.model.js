import mongoose from "mongoose";
const agentSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  aadharCard: { type: String, required: true },
  panCard: { type: String, required: true },
  govCertificate: { type: String, required: true, default: null },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  profilePhoto: { type: String, required: true, default: null },
  isIPV_Verified: { type: Boolean, default: false },
  ipvOtp: { type: String, required: false, default: null },
  ipAddress: { type: String, required: true, default: null },
  aboutUs: { type: String, default: null},
  services: {
    type: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        completion: { type: String, required: true },
        active: { type: Boolean, default: true },
        popular: { type: Boolean, default: false },
      },
    ],
    default: [],
  },
  total_earning: { type: Number, default: 0 },
  avaiable_balance: { type: Number, default: 0 },
  rating_feedback: {
    type: [
      {
        customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "govgenie-user",
        },
        rating: { type:Number, enum: [1, 2, 3, 4, 5], required: true },
        feedback: { type: String, required: true },
      },
    ],
    default: [],
  },
});

export default mongoose.model("AgentInfo", agentSchema);
