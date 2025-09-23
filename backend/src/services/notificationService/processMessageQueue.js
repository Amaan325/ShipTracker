const { dequeueMessage, getQueueLength, enqueueMessage } = require("../queue/messageQueue");
const { sendWhatsAppNotification } = require("../whatsapp/whatsapp");
const { isConnected } = require("../whatsapp/whatsapp");

async function processMessageQueue() {
  if (!isConnected()) {
    console.log("⚠️ [Notification Worker] WhatsApp not connected, skipping");
    return;
  }

  if (getQueueLength() === 0) {
    console.log("📭 [Notification Worker] No messages in queue");
    return;
  }

  const job = dequeueMessage();
  if (!job) return;

  const { to, message, vesselName, attempts = 0 } = job;
  console.log(`🚀 Sending message to ${to}: "${message}"`);

  try {
    await sendWhatsAppNotification(to, message);
    console.log(`✅ Message delivered to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send to ${to}: ${err.message}`);
    if (attempts < 3) {
      console.log(`🔁 Retrying message for ${to} (attempt ${attempts + 1})`);
      enqueueMessage(to, message, vesselName); // requeue
    }
  }
}

module.exports = { processMessageQueue };
