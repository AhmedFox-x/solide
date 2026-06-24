import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import testimonialsRouter from "./routes/testimonials";
import ticketsRouter from "./routes/tickets";
import mediaRouter from "./routes/media";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET environment variable is required");
  process.exit(1);
}

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

interface SeedProject {
  id: string; title: string; description: string; category: string; type: string;
  images: string; videos: string; models3d: string; beforeImage: string | null;
  afterImage: string | null; status: string; featured: boolean; sortOrder: number;
  createdAt: string; updatedAt: string;
}
interface SeedTestimonial {
  id: string; name: string; title: string; content: string; rating: number;
  imageUrl: string | null; company: string | null; featured: boolean;
  createdAt: string; updatedAt: string;
}
interface SeedTicket {
  id: string; name: string; email: string; phone: string | null;
  subject: string; message: string; type: string; preferredContact: string;
  status: string; priority: string; response: string | null;
  createdAt: string; updatedAt: string;
}
interface SeedAdmin {
  id: string; email: string; passwordHash: string; name: string;
  createdAt: string; updatedAt: string;
}
interface SeedMedia {
  id: string; filename: string; url: string; mimeType: string;
  sizeBytes: number; mediaType: string; altText: string | null;
  createdAt: string;
}
interface SeedData {
  projects: SeedProject[];
  testimonials: SeedTestimonial[];
  tickets: SeedTicket[];
  admins: SeedAdmin[];
  media: SeedMedia[];
}

async function seed() {
  try {
    execSync("mkdir -p /app/data/uploads", { stdio: "pipe" });
    execSync("npx prisma db push", { stdio: "pipe" });

    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const volUploadDir = path.resolve(uploadDir);
    const localUploads = ["./uploads", "./dist/../uploads"];
    for (const dir of localUploads) {
      try {
        if (fs.existsSync(dir)) {
          execSync(`cp -r ${dir}/* "${volUploadDir}/" 2>/dev/null || true`, { stdio: "pipe" });
        }
      } catch (e) { /* skip */ }
    }

    const prisma = new PrismaClient();

    const existingProjects = await prisma.project.count();
    if (existingProjects > 0) {
      console.log(`Database already has ${existingProjects} projects, skipping full seed`);
      const hash = await bcrypt.hash("Solide@2026", 12);
      await prisma.admin.upsert({
        where: { email: "admin@solide.com" },
        update: {},
        create: { email: "admin@solide.com", passwordHash: hash, name: "Solide Admin" },
      });
      await prisma.$disconnect();
      return;
    }

    let seedData: SeedData | null = null;
    const seedPaths = ["./seed-data.json", "../seed-data.json", path.join(__dirname, "../seed-data.json")];
    for (const p of seedPaths) {
      try { seedData = require(p); break; } catch { /* try next */ }
    }
    if (!seedData) {
      console.log("No seed-data.json found, skipping full seed");
      await prisma.$disconnect();
      return;
    }

    for (const a of seedData.admins) {
      await prisma.admin.upsert({
        where: { email: a.email },
        update: {},
        create: { id: a.id, email: a.email, passwordHash: a.passwordHash, name: a.name },
      });
    }
    for (const p of seedData.projects) {
      await prisma.project.upsert({
        where: { id: p.id },
        update: {},
        create: { ...p, videos: p.videos || "[]", createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) },
      });
    }
    for (const t of seedData.testimonials) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {},
        create: { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) },
      });
    }
    for (const t of seedData.tickets) {
      await prisma.ticket.upsert({
        where: { id: t.id },
        update: {},
        create: { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) },
      });
    }
    for (const m of seedData.media) {
      await prisma.media.upsert({
        where: { id: m.id },
        update: {},
        create: { ...m, createdAt: new Date(m.createdAt) },
      });
    }

    await prisma.$disconnect();
    console.log(`Database seeded: ${seedData.projects.length} projects, ${seedData.testimonials.length} testimonials, ${seedData.tickets.length} tickets, ${seedData.media.length} media`);
  } catch (e: any) {
    console.error("Seed failed:", e.message);
  }
}

app.listen(PORT, async () => {
  await seed();
  console.log(`\n  Solide API → http://localhost:${PORT}\n`);
});
