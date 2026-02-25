import { Request, Response, NextFunction } from "express";

/**
 * Middleware that checks whether the authenticated user has the "admin" role.
 * Must be used AFTER authMiddleware (which populates req.user from the JWT).
 *
 * Usage:
 *   router.get("/admin-only", authMiddleware, adminMiddleware, handler);
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
};
