import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface AuthRequest extends Request {
  admin?: { id: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, SECRET) as { id: string; email: string };
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
