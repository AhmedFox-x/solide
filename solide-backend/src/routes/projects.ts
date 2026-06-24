import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "published" },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/all", requireAuth, async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ projects });
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json({ project });
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ project });
  } catch {
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
