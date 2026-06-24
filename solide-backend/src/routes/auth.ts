import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { signToken } from "../utils/jwt";

const router = Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(admin.id, admin.email);
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  try {
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(header.split(" ")[1], process.env.JWT_SECRET || "fallback-secret") as { id: string };
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
