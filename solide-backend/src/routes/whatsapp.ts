import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/qr", requireAuth, async (_req, res) => {
  try {
    const { getWhatsAppStatus } = await import("../utils/baileys-whatsapp");
    const status = await getWhatsAppStatus() as any;
    res.json({
      connected: status.connected ?? false,
      qrCode: status.qrCode,
      session: status.session ? { status: (await status.session).status, phoneNumber: (await status.session).phoneNumber } : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get WhatsApp status" });
  }
});

export default router;
