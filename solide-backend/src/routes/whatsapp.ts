import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/qr", requireAuth, async (_req: Request, res: Response) => {
  try {
    const m = await import("../utils/baileys-whatsapp");
    const connected = m.isWhatsAppConnected();
    const session = await m.getWhatsAppStatus();
    res.json({ connected, qrCode: session?.qrCode || null });
  } catch {
    res.status(500).json({ error: "Failed to get WhatsApp status" });
  }
});

router.get("/qr/page", async (_req: Request, res: Response) => {
  try {
    const m = await import("../utils/baileys-whatsapp");
    const connected = m.isWhatsAppConnected();
    const session = await m.getWhatsAppStatus();
    const qrCode = session?.qrCode ?? null;
    const isError = qrCode && qrCode.length > 1000 ? false : session?.status === "error";
    if (!qrCode || isError) {
      const msg = isError ? `⚠️ خطأ: ${qrCode || "فشل الاتصال"}` : (connected ? "متصل ✅" : "...مش بجهز QR، استنى شوية وحاول تفتح الصفحة تاني");
      return res.send(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>WhatsApp QR</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#111;color:#fff;text-align:center}div{max-width:400px}p{color:#888;margin-top:20px}</style></head><body><div><h2>WhatsApp</h2><p>${msg}</p></div></body></html>`);
    }
    res.send(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>WhatsApp QR</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#111;color:#fff;text-align:center}div{max-width:400px}img{width:300px;height:300px;border-radius:12px;image-rendering:pixelated}#status{color:#888;margin-top:20px;font-size:14px}#sub{color:#555;font-size:12px;margin-top:8px}</style></head><body><div><h2>📱 امسح QR برابط واتساب</h2><img id="qr" src="data:image/png;base64,${qrCode}" alt="QR Code"/><p id="status">افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز</p><p id="sub">ثواني ٢٠ ثانية</p><script>let n=20;setInterval(()=>{n--;if(n<=0){n=20;fetch(location.href).then(r=>r.text()).then(h=>{let m=h.match(/src="data:image\\/png;base64,([^"]+)"/);if(m){document.getElementById('qr').src='data:image/png;base64,'+m[1];let s=h.match(/<p id="status">([^<]+)<\\/p>/);if(s)document.getElementById('status').innerHTML=s[1];}}).catch(()=>{});}document.getElementById('sub').textContent=n+' ثواني';},1000);</script></div></body></html>`);
  } catch {
    res.status(500).send("Error loading QR");
  }
});

export default router;
