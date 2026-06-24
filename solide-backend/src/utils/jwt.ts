import jwt from "jsonwebtoken";

export function signToken(id: string, email: string): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ id, email }, secret, { expiresIn: "7d" });
}
