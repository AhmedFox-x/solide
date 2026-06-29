let twilioClient: any = null;

function getClient() {
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

export function sendWhatsApp(body: string): void {
  const client = getClient();
  if (!client) {
    console.log("WhatsApp notification skipped: TWILIO_ACCOUNT_SID/AUTH_TOKEN not configured or twilio package missing");
    return;
  }

  const ownerPhone = process.env.OWNER_WHATSAPP;
  if (!ownerPhone) {
    console.log("WhatsApp notification skipped: OWNER_WHATSAPP not configured");
    return;
  }

  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  client.messages
    .create({
      from,
      to: `whatsapp:${ownerPhone.replace(/[^0-9]/g, "")}`,
      body,
    })
    .then(() => console.log("WhatsApp notification sent to owner"))
    .catch((err: any) => console.error("WhatsApp notification failed:", err.message));
}
