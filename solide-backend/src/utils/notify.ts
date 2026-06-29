let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return null;
    const nodemailer = require("nodemailer");
    transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    return transporter;
  } catch {
    return null;
  }
}

let twilioClient: any = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) return null;
    const twilio = require("twilio");
    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
  } catch {
    return null;
  }
}

const DEFAULT_OWNER_PHONE = "201060512080";

function ownerPhone(): string | null {
  const raw = process.env.OWNER_WHATSAPP || DEFAULT_OWNER_PHONE;
  if (!raw) return null;
  return raw.replace(/[^0-9]/g, "");
}

function ownerEmail(): string | null {
  return process.env.OWNER_EMAIL || null;
}

export function sendWhatsApp(body: string): void {
  const client = getTwilioClient();
  if (!client) {
    console.log("WhatsApp skipped: TWILIO_ACCOUNT_SID/AUTH_TOKEN not configured");
    return;
  }
  const phone = ownerPhone();
  if (!phone) {
    console.log("WhatsApp skipped: no owner phone");
    return;
  }
  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  client.messages
    .create({ from, to: `whatsapp:${phone}`, body })
    .then(() => console.log("WhatsApp sent to", phone))
    .catch((err: any) => console.error("WhatsApp failed:", err.message));
}

export function sendEmail(subject: string, text: string): void {
  const t = getTransporter();
  if (!t) {
    console.log("Email skipped: SMTP_HOST/USER/PASS not configured");
    return;
  }
  const to = ownerEmail();
  if (!to) {
    console.log("Email skipped: OWNER_EMAIL not configured");
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@solide.com";
  t.sendMail({ from, to, subject, text })
    .then(() => console.log("Email sent to", to))
    .catch((err: any) => console.error("Email failed:", err.message));
}

export function logFallbackWaLink(body: string): void {
  const phone = ownerPhone();
  if (!phone) return;
  const encoded = encodeURIComponent(body);
  console.log("");
  console.log("═══════════════════════════════════════════════");
  console.log("  🔔 New order — open WhatsApp to notify owner:");
  console.log(`  https://wa.me/${phone}?text=${encoded}`);
  console.log("═══════════════════════════════════════════════");
  console.log("");
}
