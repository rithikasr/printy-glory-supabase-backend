import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes
  resendCount: { type: Number, default: 0 },   // max 5/day
  lastResend: { type: Date, default: null }
});

export default mongoose.model("ResetToken", resetTokenSchema);
