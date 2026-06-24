import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  admin?: { id: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET!;
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    req.admin = decoded;
    next();
  } catch (err) {
    const message = err instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token";
    return res.status(401).json({ error: message });
  }
}
