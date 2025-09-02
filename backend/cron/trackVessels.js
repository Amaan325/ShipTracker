const cron = require("node-cron");
const { updateVesselsQueue } = require("../src/services/vesselService");

/**
 * Schedule the vessel tracking cron job.
 * Runs every minute to respect AISHub rate limits.
 */
const startVesselTracking = () => {
  cron.schedule("* * * * *", async () => {
    try {
      await updateVesselsQueue();
    } catch (err) {
      console.error("🚨 Vessel tracking job failed:", err.message);
    }
  });

  console.log("⏱ Vessel tracking cron started (every minute)");
};

module.exports = { startVesselTracking };
