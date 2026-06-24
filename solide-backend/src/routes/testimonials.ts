import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ testimonials });
  } catch {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    res.status(201).json({ testimonial });
  } catch {
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ testimonial });
  } catch {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

export default router;
