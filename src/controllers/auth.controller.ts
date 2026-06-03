import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET: string | any = `${process.env.JWT_SECRET}` || "dev_secret_key";
const JWT_EXPIRES_IN: string | any = `${process.env.JWT_EXPIRES_IN}` || "7d";

export const register = async (req: Request, res: Response) => {
  try {
    let { name, email, password } = req.body;
    email = email.toLowerCase();

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
    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // FIXED VERSION
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }

};

/**
 * GET /auth/me
 * Returns the current user's profile from the JWT token.
 * Requires authMiddleware.
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /admin/make-admin
 * Promotes a user to admin by email.
 * Requires authMiddleware + adminMiddleware (only admins can create admins).
 */
export const makeAdmin = async (req: Request, res: Response) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    email = email.toLowerCase();

    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(`👑 User ${user.email} promoted to admin`);
    return res.json({
      success: true,
      message: `${user.email} is now an admin`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
