// src/services/notificationService.js
const { enqueueMessage, dequeueMessage, getQueueLength } = require("./messageQueue");
const { NOTIFICATION_THRESHOLDS } = require("../../config/notificationConfig");
const { normalizePhoneNumber } = require("../utils/formatters");
const { sendWhatsAppNotification } = require("./notify");
const { isConnected } = require("./whatsapp");

function markHigherThresholds(vessel, index) {
  for (let j = index + 1; j < NOTIFICATION_THRESHOLDS.length; j++) {
    const higher = NOTIFICATION_THRESHOLDS[j];
    if (!vessel[higher.key]) {
      vessel[higher.key] = true;
      console.log(
        `✅ [Vessel:${vessel.name}] Auto-marked ${higher.threshold}h as notified`
      );
    }
  }
}

async function checkAndQueueNotification(vessel, etaHours) {
  for (let i = 0; i < NOTIFICATION_THRESHOLDS.length; i++) {
    const t = NOTIFICATION_THRESHOLDS[i];
    if (etaHours <= t.threshold) {
      if (vessel[t.key]) return false;

      const phone = normalizePhoneNumber(vessel.engineer?.phone_number);
      if (!phone) return false;

      markHigherThresholds(vessel, i);

      vessel[t.key] = true;
      await vessel.save();

      const message = t.message(vessel);
      enqueueMessage(phone, message, vessel.name);
      console.log(`📩 Queued ${t.threshold}h notification for ${vessel.name}`);
      return true;
    }
  }
  return false;
}

// New: process queued messages
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

module.exports = { checkAndQueueNotification, processMessageQueue };
