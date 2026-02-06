import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt  from "jsonwebtoken";

const JWT_SECRET:string| any = `${process.env.JWT_SECRET}` || "dev_secret_key";
const JWT_EXPIRES_IN:string| any = `${process.env.JWT_EXPIRES_IN}` || "7d";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
  console.error("REGISTER ERROR:", error);
  return res.status(500).json({ message: error.message });
}

};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // FIXED VERSION
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,                    // <-- SAFE string type
       { expiresIn: JWT_EXPIRES_IN }  // <-- SAFE type
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error: any) {
  console.error("LOGIN ERROR:", error);
  return res.status(500).json({ message: error.message });
}

};