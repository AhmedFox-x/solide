import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback-secret";

export function signToken(id: string, email: string): string {
  return jwt.sign({ id, email }, SECRET, { expiresIn: "7d" });
}
