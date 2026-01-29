import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
