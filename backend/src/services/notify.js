// services/notify.js
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function sendWhatsAppNotification(to, message) {
  try {
    await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio sandbox
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(`✅ WhatsApp sent to ${to}: ${message}`);
  } catch (err) {
    console.error("❌ WhatsApp send failed:", err.message);
  }
}

module.exports = { sendWhatsAppNotification };
