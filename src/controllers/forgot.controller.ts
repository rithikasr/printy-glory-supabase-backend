import { Request, Response } from "express";
import User from "../models/user.model";
import ResetToken from "../models/resetToken.model";
import { sendEmail } from "../utils/sendEmail";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not found" });

    let token = await ResetToken.findOne({ email });

    // 5 times resend/day limit
    if (token) {
      const today = new Date().toDateString();
      const last = token.lastResend?.toDateString();

      if (last === today && token.resendCount >= 5) {
        return res.status(429).json({ message: "OTP resend limit reached (5/day)" });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!token) {
      token = new ResetToken({
        email,
        otp,
        resendCount: 1,
        lastResend: new Date(),
      });
    } else {
      token.otp = otp;
      token.resendCount += 1;
      token.lastResend = new Date();
    }

    await token.save();

    await sendEmail(
      email,
      "Your OTP for Password Reset",
      `Your OTP is ${otp}. It expires in 5 minutes.`
    );

    return res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};


export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const token = await ResetToken.findOne({ email });
    if (!token) return res.status(400).json({ message: "OTP expired" });

    if (otp !== token.otp)
      return res.status(400).json({ message: "Invalid OTP" });

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    return res.status(500).json({ error });
  }
};


import bcrypt from "bcryptjs";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    await ResetToken.deleteOne({ email });

    return res.json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    return res.status(500).json({ error });
  }
};
