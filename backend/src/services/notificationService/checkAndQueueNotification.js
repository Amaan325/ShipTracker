const { enqueueMessage } = require("../queue/messageQueue");
const { NOTIFICATION_THRESHOLDS } = require("../../../config/notificationConfig");
const { normalizePhoneNumber } = require("../../utils/formatters");

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

      const message = t.message(vessel);
      if (!message) return false;

      // ✅ Normal case (mark + send)
      markHigherThresholds(vessel, i);
      vessel[t.key] = true;
      await vessel.save();

      enqueueMessage(phone, message, vessel.name);
      console.log(`📩 Queued ${t.threshold}h notification for ${vessel.name}`);
      return true;
    }
  }
  return false;
}

module.exports = { checkAndQueueNotification };
