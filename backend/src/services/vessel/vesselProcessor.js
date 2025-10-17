const { mergeAISFields } = require("../../utils/vesselUtils");
const { computeEta, calculateDistanceToPort } = require("../etaService");
const { handleArrival } = require("./vesselArrival");
const {
  ZONE_ENTRY_NOTIFICATION,
} = require("../../../config/notificationConfig");
const {
  normalizePhoneNumber,
  formatEtaHours,
} = require("../../utils/formatters");
const { isDestinationMatch } = require("../../utils/matchers");
const {
  checkAndQueueNotification,
} = require("../notificationService/notificationService");
const { enqueueMessage } = require("../queue/messageQueue");
const { recordApiCall } = require("../../controllers/apiStatsController");

// after you receive data

async function processVessel(vessel, latest) {
  const vesselTag = `[Vessel:${vessel.name}]`;
  console.log(`${vesselTag} [RAW] ${JSON.stringify(latest.__source)}`);
  await recordApiCall(latest.__source);

  // Merge AIS/VF fields
  mergeAISFields(vessel, latest);

  const sog = Number(vessel.sog || 0);
  const cog = Number(vessel.cog || 0);
  console.log(`${vesselTag} 🧭 Speed: ${sog}kn | Course: ${cog}°`);

  // Check destination
  if (!isDestinationMatch(vessel.destination, vessel.port?.unlocode)) {
    console.warn(
      `${vesselTag} ⛔ Destination mismatch. Saving partial update and skipping notifications.`
    );
    try {
      await vessel.save();
      console.log(`${vesselTag} 💾 Saved partial (destination mismatch)`);
    } catch (err) {
      console.error(
        `${vesselTag} ❌ Failed to save after destination mismatch: ${err.message}`
      );
    }
    return;
  }

  // Compute ETA & distance
  const etaHours = computeEta(vessel, sog, vessel.port);
  const distanceToPort = calculateDistanceToPort(
    { latitude: vessel.latitude, longitude: vessel.longitude },
    vessel.port
  );

  console.log(
    `${vesselTag} ⏱ ETA(calc): ${formatEtaHours(etaHours)} | Distance: ${Number(
      distanceToPort
    ).toFixed(1)}nm | Provider ETA: ${vessel.eta}`
  );

  const portRadiusNm =
    vessel.port?.radiusNm || ZONE_ENTRY_NOTIFICATION.radiusNm;
  console.log(
    `Radius of ${vessel.port.arrival_port_name} is ${portRadiusNm}nm`
  );

  // ✅ Zone entry notification for all engineers
  // ✅ Zone entry notification for all engineers
  if (!vessel[ZONE_ENTRY_NOTIFICATION.key] && distanceToPort <= portRadiusNm) {
    const msg = ZONE_ENTRY_NOTIFICATION.message(vessel); // generate once

    if (msg) {
      for (const engineer of vessel.engineers || []) {
        const phone = normalizePhoneNumber(engineer.phone_number);
        if (phone) {
          enqueueMessage(phone, msg, vessel.name);
          console.log(
            `${vesselTag} 📩 Zone entry notification sent to ${engineer.engineer_name} (${phone})`
          );
        } else {
          console.warn(
            `${vesselTag} ⚠️ Zone entry: engineer ${
              engineer?.engineer_name || "N/A"
            } has no phone`
          );
        }
      }

      // ✅ Mark flags after all engineers notified
      vessel[ZONE_ENTRY_NOTIFICATION.key] = true;
      vessel.notified_12h = true;
      vessel.notified_48h = true;
    }
  }

  // Threshold notifications (12h, 48h, etc.)
  for (const engineer of vessel.engineers || []) {
    const phone = normalizePhoneNumber(engineer.phone_number);
    if (phone) {
      await checkAndQueueNotification(
        vessel,
        etaHours,
        phone,
        engineer.engineer_name
      );
    }
  }

  // Arrival handling
  const deleted = await handleArrival(vessel, etaHours, sog, distanceToPort);
  if (deleted) return;

  // Save vessel
  try {
    await vessel.save();
    console.log(`${vesselTag} 💾 Saved successfully`);
  } catch (err) {
    console.error(`${vesselTag} ❌ Failed to save: ${err.message}`);
  }
}

module.exports = { processVessel };
