// services/notificationService.js
const { sendWhatsAppNotification } = require("../services/notify");

/**
 * Send with retries. Assumes sendWhatsAppNotification throws on failure.
 */
async function sendNotificationWithRetry(phone, message, vesselName, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendWhatsAppNotification(phone, message);
      console.log(`✅ [Notify:${vesselName}] Message sent (attempt ${attempt})`);
      return true;
    } catch (error) {
      console.warn(`⚠️ [Notify:${vesselName}] Failed (attempt ${attempt}):`, error?.message ?? error);
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
  }
  return false;
}

/**
 * Mark all PRIOR notifications as true.
 * Prior = thresholds with a STRICTLY LARGER hour value than the sent one.
 * Example: thresholds = [48,24,12,...]
 * If we send 24h, mark 48h as already sent (since it's "earlier" in time).
 */
function markAllPriorNotifications(vessel, currentKey, NOTIFICATION_THRESHOLDS) {
  const current = NOTIFICATION_THRESHOLDS.find((t) => t.key === currentKey);
  if (!current) return;

  NOTIFICATION_THRESHOLDS.forEach((t) => {
    if (t.threshold > current.threshold) {
      vessel[t.key] = true;
    }
  });
}

module.exports = { sendNotificationWithRetry, markAllPriorNotifications };
