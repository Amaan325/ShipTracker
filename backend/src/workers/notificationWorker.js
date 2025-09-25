// src/workers/notificationWorker.js
const cron = require("node-cron");
const {
  processMessageQueue,
} = require("../services/notificationService/notificationService");

function startNotificationWorker() {
  console.log("🚀 Notification worker starting...");

  // Run every 30 seconds
  cron.schedule("*/15 * * * * *", async () => {
    try {
      await processMessageQueue();
    } catch (err) {
      console.error("❌ Notification Worker error:", err.message);
    }
  });

  console.log("✅ Notification worker initialized");
}

module.exports = { startNotificationWorker };
