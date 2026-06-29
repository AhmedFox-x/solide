import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let sock: any = null;
let connected = false;
let currentQr: string | null = null;

async function getPrismaSession() {
  let session = await prisma.whatsAppSession.findFirst({ orderBy: { createdAt: "desc" } });
  if (!session) {
    session = await prisma.whatsAppSession.create({ data: { id: "primary" } });
  }
  return session;
}

export async function startBaileys(): Promise<void> {
  try {
    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import("@whiskeysockets/baileys");
    const { toBuffer } = await import("qrcode");
    const path = await import("path");
    const fs = await import("fs");

    const authDir = process.env.UPLOAD_DIR
      ? path.default.resolve(process.env.UPLOAD_DIR, ".baileys-auth")
      : path.default.resolve("./.baileys-auth");
    if (!fs.default.existsSync(authDir)) fs.default.mkdirSync(authDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
      printQRInTerminal: false,
      auth: state,
      logger: { level: "silent" } as any,
      emitOwnEvents: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQr = qr;
        try {
          const qrBuffer = await toBuffer(qr);
          const qrB64 = qrBuffer.toString("base64");
          console.log("");
          console.log("═══════════════════════════════════════════════");
          console.log("  📱 WhatsApp QR code generated!");
          console.log("  Open WhatsApp → Linked Devices → Link a Device");
          console.log("  Scan the QR below:");
          console.log("");
          console.log(qr);
          console.log("");
          console.log("  Or view QR as base64 image via:");
          console.log("  GET /api/whatsapp/qr");
          console.log("═══════════════════════════════════════════════");
          console.log("");
          await prisma.whatsAppSession.upsert({
            where: { id: "primary" },
            update: { qrCode: qrB64, status: "awaiting_scan" },
            create: { id: "primary", qrCode: qrB64, status: "awaiting_scan" },
          });
        } catch {}
        return;
      }

      if (connection === "open") {
        connected = true;
        currentQr = null;
        const phone = sock?.user?.id?.split(":")[0] || null;
        await prisma.whatsAppSession.upsert({
          where: { id: "primary" },
          update: { status: "connected", qrCode: null, phoneNumber: phone },
          create: { id: "primary", status: "connected", phoneNumber: phone },
        });
        console.log(`✅ WhatsApp connected${phone ? ` (${phone})` : ""}`);
      }

      if (connection === "close") {
        connected = false;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        await prisma.whatsAppSession.upsert({
          where: { id: "primary" },
          update: { status: "disconnected", qrCode: null },
          create: { id: "primary", status: "disconnected" },
        });
        console.log("WhatsApp disconnected" + (shouldReconnect ? ", reconnecting..." : ""));
        if (shouldReconnect) {
          setTimeout(() => startBaileys(), 5000);
        }
      }
    });
  } catch (err: any) {
    console.log("Baileys init skipped:", err.message);
  }
}

export async function sendWhatsAppBaileys(to: string, message: string): Promise<boolean> {
  if (!connected || !sock) {
    console.log("WhatsApp (Baileys) not connected, skipping");
    return false;
  }
  try {
    const jid = `${to.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    console.log("WhatsApp (Baileys) sent to", to);
    return true;
  } catch (err: any) {
    console.error("WhatsApp (Baileys) failed:", err.message);
    return false;
  }
}

export function getWhatsAppStatus() {
  return {
    connected,
    qrCode: currentQr,
    session: prisma.whatsAppSession.findFirst({ orderBy: { createdAt: "desc" } }),
  };
}

export function isWhatsAppConnected(): boolean {
  return connected;
}
