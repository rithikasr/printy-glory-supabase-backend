import { Request, Response, NextFunction } from "express";

export const adminAuth = (_req: any, _res: any, next: any) => {
  (_req as any).user = { role: "admin" };
  next();
};

// export const adminAuth = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const user = (req as any).user;

//   if (!user || user.role !== "admin") {
//     return res.status(403).json({ message: "Admin access only" });
//   }

//   next();
// };
