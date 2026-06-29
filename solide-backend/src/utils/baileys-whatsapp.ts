import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let sock: any = null;
let connected = false;

function emitError(msg: string) {
  console.error("Baileys error:", msg);
  prisma.whatsAppSession.upsert({
    where: { id: "primary" },
    update: { status: "error", qrCode: msg },
    create: { id: "primary", status: "error", qrCode: msg },
  }).catch(() => {});
}

export async function startBaileys(): Promise<void> {
  try {
    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = await import("@whiskeysockets/baileys");
    const { toBuffer } = await import("qrcode");
    const path = await import("path");
    const fs = await import("fs");

    const authDir = process.env.UPLOAD_DIR
      ? path.default.resolve(process.env.UPLOAD_DIR, ".baileys-auth")
      : path.default.resolve("./.baileys-auth");
    if (!fs.default.existsSync(authDir)) fs.default.mkdirSync(authDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    const { version } = await fetchLatestBaileysVersion();
    console.log("Baileys using version:", version);

    sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      version,
      syncFullHistory: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrBuffer = await toBuffer(qr);
          const qrB64 = qrBuffer.toString("base64");
          console.log("WhatsApp QR generated, save to DB");
          await prisma.whatsAppSession.upsert({
            where: { id: "primary" },
            update: { qrCode: qrB64, status: "awaiting_scan" },
            create: { id: "primary", qrCode: qrB64, status: "awaiting_scan" },
          });
        } catch (e: any) {
          emitError("QR save failed: " + e.message);
        }
        return;
      }

      if (connection === "open") {
        connected = true;
        const phone = sock?.user?.id?.split(":")[0] || null;
        await prisma.whatsAppSession.upsert({
          where: { id: "primary" },
          update: { status: "connected", qrCode: null, phoneNumber: phone },
          create: { id: "primary", status: "connected", phoneNumber: phone },
        });
        console.log("WhatsApp connected" + (phone ? " (" + phone + ")" : ""));
      }

      if (connection === "close") {
        connected = false;
        const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
        await prisma.whatsAppSession.upsert({
          where: { id: "primary" },
          update: { status: "disconnected", qrCode: null },
          create: { id: "primary", status: "disconnected" },
        });
        console.log("WhatsApp disconnected" + (isLoggedOut ? " (logged out)" : ", reconnecting..."));
        if (!isLoggedOut) {
          setTimeout(() => startBaileys(), 5000);
        }
      }
    });

    sock.ev.on("messaging-history.set", () => {});
  } catch (err: any) {
    emitError(err.message || "Unknown init error");
    console.error("Baileys init error:", err);
    setTimeout(() => startBaileys(), 10000);
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

export async function getWhatsAppStatus() {
  const session = await prisma.whatsAppSession.findUnique({ where: { id: "primary" } });
  return {
    connected,
    qrCode: session?.qrCode ?? null,
    phoneNumber: session?.phoneNumber ?? null,
    status: session?.status ?? "disconnected",
  };
}

export function isWhatsAppConnected(): boolean {
  return connected;
}
