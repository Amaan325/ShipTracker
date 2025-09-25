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

      const message = t.message(vessel);
      if (!message) return false;

      // ✅ Mark thresholds before sending
      markHigherThresholds(vessel, i);
      vessel[t.key] = true;
      await vessel.save();

      // ✅ Loop through all assigned engineers
      if (Array.isArray(vessel.engineers) && vessel.engineers.length > 0) {
        for (const eng of vessel.engineers) {
          const phone = normalizePhoneNumber(eng?.phone_number);
          if (phone) {
            enqueueMessage(phone, message, vessel.name);
            console.log(
              `📩 Queued ${t.threshold}h notification for ${vessel.name} → Engineer: ${eng.engineer_name}`
            );
          }
        }
      } else {
        console.warn(
          `⚠️ [Vessel:${vessel.name}] No engineers assigned, notification skipped.`
        );
      }

      return true;
    }
  }
  return false;
}

module.exports = { checkAndQueueNotification };
