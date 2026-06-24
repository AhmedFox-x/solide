import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import testimonialsRouter from "./routes/testimonials";
import ticketsRouter from "./routes/tickets";
import mediaRouter from "./routes/media";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "./uploads")));

app.get("/health", (_req, res) => res.json({ status: "ok" }));


app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/media", mediaRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

async function seed() {
  try {
    execSync("npx prisma db push", { stdio: "pipe" });
    const prisma = new PrismaClient();
    const hash = await bcrypt.hash("Solide@2026", 12);
    await prisma.admin.upsert({
      where: { email: "admin@solide.com" },
      update: {},
      create: { email: "admin@solide.com", passwordHash: hash, name: "Solide Admin" },
    });
    await prisma.$disconnect();
    console.log("Database seeded successfully");
  } catch (e: any) {
    console.error("Seed failed:", e.message);
  }
}

app.listen(PORT, async () => {
  await seed();
  console.log(`\n  Solide API → http://localhost:${PORT}\n`);
});
