// src/services/vesselService.js
const Vessel = require("../models/vesselModel");
const { fetchAISDataForBatch } = require("./aisService");
const {
  getNextBatch,
  requeueBatch,
  initVesselQueue,
  removeFailedBatch,
} = require("./vesselQueue");
const { ZONE_ENTRY_NOTIFICATION, NOTIFICATION_THRESHOLDS } = require("../../config/notificationConfig");

const { normalizePhoneNumber, formatEtaHours } = require("../utils/formatters");
const { isDestinationMatch } = require("../utils/matchers");

const {
  computeEta,
  shouldMarkAsArrived,
  calculateDistanceToPort,
} = require("./etaService");

const { checkAndQueueNotification } = require("./notificationService");
const { enqueueMessage } = require("./messageQueue");

const BATCH_SIZE = 50;
const MAX_RETRIES = 5;

/**
 * Fetch AIS records with retries and detailed logging
 */
async function fetchAISRecords(batchMMSIs) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `🌊 [AIS] Fetching batch: ${batchMMSIs.join(", ")} (Attempt ${attempt})`
      );
      const records = await fetchAISDataForBatch(batchMMSIs);

      if (records && records.length > 0) {
        console.log(`✅ [AIS] Successfully fetched ${records.length} records`);
        return records;
      }

      const delay = Math.min(1000 * 2 ** attempt, 30000);
      console.warn(
        `⚠️ [AIS] No records returned, retrying in ${delay / 1000}s`
      );
      await new Promise((r) => setTimeout(r, delay));
    } catch (err) {
      console.error(`❌ [AIS] Fetch error: ${err.message}`);
      if (err.message.includes("Too frequent requests")) {
        console.warn("⏳ [AIS] Rate limited, waiting 60s before next attempt");
        await new Promise((r) => setTimeout(r, 60000));
      }
    }
  }

  console.error("❌ [AIS] Max retries reached, returning empty array");
  return [];
}

/**
 * Queue vessel arrival notification (once only)
 */
async function handleArrival(vessel, etaHours, sog, distanceToPort) {
  if (vessel.notified_arrival) return false;

  if (
    etaHours === Infinity ||
    shouldMarkAsArrived(etaHours, sog, distanceToPort)
  ) {
    const phone = normalizePhoneNumber(vessel.engineer?.phone_number);
    if (!phone) {
      console.warn(
        `⚠️ [Vessel:${vessel.name}] No engineer phone number for arrival notification`
      );
      return false;
    }

    console.log(`📩 [Vessel:${vessel.name}] Queuing ARRIVAL notification`);
    enqueueMessage(
      phone,
      `✅ ${vessel.name} has arrived at ${vessel.port.arrival_port_name}`,
      vessel.name
    );

    vessel.notified_arrival = true;
    vessel.status = "arrived";

    console.log(`🚢 [Vessel:${vessel.name}] Marked as ARRIVED`);

    // Delete vessel from DB
    try {
      await Vessel.deleteOne({ _id: vessel._id });
      console.log(`🗑️ [Vessel:${vessel.name}] Deleted from database`);
    } catch (err) {
      console.error(
        `❌ [Vessel:${vessel.name}] Failed to delete: ${err.message}`
      );
    }

    return true;
  }
  return false;
}

/**
 * Process a single vessel with detailed logs
 */
async function processVessel(vessel, latest) {
  // ------------------- Update Vessel -------------------
  vessel.latitude = latest.LATITUDE;
  vessel.longitude = latest.LONGITUDE;
  vessel.destination = latest.DEST;
  vessel.eta = latest.ETA;
  vessel.lastUpdated = new Date();

  const sog = Number(latest.SOG || latest.sog || latest.SPEED || 0);
  console.log(`🧭 [Vessel:${vessel.name}] Speed = ${sog} knots`);

  // ------------------- Check Destination -------------------
  if (!isDestinationMatch(vessel.destination, vessel.port?.unlocode)) {
    console.warn(`⛔ [Vessel:${vessel.name}] Destination mismatch`);
    await vessel.save();
    return;
  }

  // ------------------- Compute ETA & Distance -------------------
  const etaHours = computeEta(vessel, sog, vessel.port);
  const distanceToPort = calculateDistanceToPort(
    { latitude: vessel.latitude, longitude: vessel.longitude },
    vessel.port
  );

  console.log(
    `⏱ [Vessel:${vessel.name}] ETA: ${formatEtaHours(
      etaHours
    )} | Distance: ${distanceToPort.toFixed(2)} nm | AIS ETA raw: ${vessel.eta}`
  );

  const phone = normalizePhoneNumber(vessel.engineer?.phone_number);

  // ------------------- Zone Entry Notification -------------------
  if (!vessel[ZONE_ENTRY_NOTIFICATION.key] && distanceToPort <= ZONE_ENTRY_NOTIFICATION.radiusNm) {
    if (phone) {
      enqueueMessage(phone, ZONE_ENTRY_NOTIFICATION.message(vessel), vessel.name);
      vessel[ZONE_ENTRY_NOTIFICATION.key] = true;
      console.log(`📩 [Vessel:${vessel.name}] Zone entry notification sent`);

      // Auto-mark higher thresholds as notified (6h+)
      const zoneThresholdIndex = NOTIFICATION_THRESHOLDS.findIndex((t) => t.threshold >= 6);
      if (zoneThresholdIndex >= 0) {
        for (let j = zoneThresholdIndex; j < NOTIFICATION_THRESHOLDS.length; j++) {
          const higher = NOTIFICATION_THRESHOLDS[j];
          if (!vessel[higher.key]) {
            vessel[higher.key] = true;
            console.log(
              `✅ [Vessel:${vessel.name}] Auto-marked ${higher.threshold}h as notified due to zone entry`
            );
          }
        }
      }
    }
  }

  // ------------------- Arrival Notification -------------------
  const deleted = await handleArrival(vessel, etaHours, sog, distanceToPort);
  if (deleted) return;

  // ------------------- Threshold Notifications -------------------
  if (phone) {
    await checkAndQueueNotification(vessel, etaHours);
  }

  // ------------------- Save Vessel -------------------
  try {
    await vessel.save();
    console.log(`💾 [Vessel:${vessel.name}] Saved successfully`);
  } catch (err) {
    console.error(`❌ [Vessel:${vessel.name}] Failed to save: ${err.message}`);
  }
}

/**
 * Main AIS update function with batch logs
 */
const updateVesselsQueue = async () => {
  console.log("🚢 [Queue] Running AIS update at", new Date().toISOString());
  await initVesselQueue();

  const batchMMSIs = getNextBatch(BATCH_SIZE);
  if (!batchMMSIs.length) {
    console.log("ℹ️ No MMSIs in queue.");
    return;
  }

  const records = await fetchAISRecords(batchMMSIs);
  if (!records.length) {
    console.error("❌ [AIS] Batch failed after max retries. Re-queueing.");
    requeueBatch(batchMMSIs);
    return;
  }

  removeFailedBatch(batchMMSIs);

  const vessels = await Vessel.find({ mmsi: { $in: batchMMSIs } })
    .populate("port")
    .populate("engineer");

  console.log(`🌊 [Batch] Updating ${vessels.length} vessels`);

  for (const vessel of vessels) {
    try {
      const latest = records.find(
        (r) => String(r.MMSI) === String(vessel.mmsi)
      );
      if (!latest) {
        console.warn(`⚠️ [Vessel:${vessel.name}] No AIS record found`);
        continue;
      }

      await processVessel(vessel, latest);
    } catch (err) {
      console.error(
        `❌ [Vessel:${vessel.name}] Processing failed: ${err.message}`
      );
    }
  }

  console.log(`✅ [Queue] AIS update completed at ${new Date().toISOString()}`);
};

module.exports = { updateVesselsQueue, processVessel, handleArrival };
