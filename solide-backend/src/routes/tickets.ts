import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const EG_PHONE = /^01[0-2,5]{1}[0-9]{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, type, preferredContact } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Name, email, subject, and message required" });
    }
    const contact = preferredContact === "email" ? "email" : "whatsapp";
    if (contact === "whatsapp") {
      if (!phone || !EG_PHONE.test(phone.replace(/\s/g, ""))) {
        return res.status(400).json({ error: "Valid Egyptian phone number required for WhatsApp contact" });
      }
    } else {
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: "Valid email address required" });
      }
    }
    const ticket = await prisma.ticket.create({
      data: { name, email, phone, subject, message, type: type || "inquiry", preferredContact: contact },
    });
    res.status(201).json({ ticket });
  } catch {
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ tickets });
  } catch {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json({ ticket });
  } catch {
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const data: any = { ...req.body };
    if (data.response) data.respondedAt = new Date();
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ ticket });
  } catch {
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.ticket.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

export default router;
