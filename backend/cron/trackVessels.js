// cron/trackVessels.js
const cron = require("node-cron");
const { startAISWorker } = require("../src/workers/aisWorker.js");
const {
  startNotificationWorker,
} = require("../src/workers/notificationWorker");

function startVesselTracking() {

  // AIS Worker: every 2 minutes
  startAISWorker();

  // Notification Worker: every 2 seconds
  startNotificationWorker();

}

module.exports = { startVesselTracking };
