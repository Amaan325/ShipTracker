// src/workers/aisWorker.js
const cron = require("node-cron");
const { updateVesselsQueue } = require("../services/vesselService.js");

const startAISWorker = () => {
  console.log("🚀 TrackVessels workers starting...");

  // Run every 2 minutes
  cron.schedule("*/3 * * * *", async () => {
    console.log(`🚢 [Queue] Running AIS update at ${new Date().toISOString()}`);
    try {
      await updateVesselsQueue();
    } catch (error) {
      console.error("❌ AIS Worker error:", error.message);
    }
  });

  console.log("✅ AIS worker initialized");
};

module.exports = {startAISWorker}