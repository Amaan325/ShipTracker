const Vessel = require("../models/vesselModel");
const { fetchAISDataForBatch } = require("./aisService");
const {
  getNextBatch,
  requeueBatch,
  initVesselQueue,
  removeFailedBatch,
} = require("./vesselQueue");

const { normalizePhoneNumber, formatEtaHours } = require("../utils/formatters");
const { isDestinationMatch } = require("../utils/matchers");

const {
  computeEta,
  shouldMarkAsArrived,
  calculateDistanceToPort,
  isEtaCalculationReliable,
} = require("./etaService");

const {
  sendNotificationWithRetry,
  markAllPriorNotifications,
} = require("./notificationService");

const { NOTIFICATION_THRESHOLDS } = require("../../config/notificationConfig");

const BATCH_SIZE = 50;
const MAX_RETRIES = 5;

/**
 * Fetch AIS records with retries
 */
async function fetchAISRecords(batchMMSIs) {
  let records = [];
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    records = await fetchAISDataForBatch(batchMMSIs);
    if (records.length) {
      console.log(`✅ [AIS] Fetched ${records.length} records (attempt ${attempt})`);
      break;
    }
    const delay = Math.min(1000 * 2 ** attempt, 30000);
    console.warn(`⚠️ [AIS] Fetch failed (attempt ${attempt}). Retrying in ${delay / 1000}s...`);
    await new Promise((r) => setTimeout(r, delay));
  }
  return records;
}

/**
 * Send ETA threshold notifications if any
 */
async function handleEtaThresholdNotifications(vessel, etaHours, sog, distanceToPort) {
  if (!isEtaCalculationReliable(sog, distanceToPort)) return;

  const nextThreshold = NOTIFICATION_THRESHOLDS.filter(
    (t) => etaHours <= t.threshold && !vessel[t.key]
  )
    .sort((a, b) => a.threshold - b.threshold)
    .shift();

  if (nextThreshold) {
    const phone = normalizePhoneNumber(vessel.engineer?.phone_number);
    if (!phone) return;

    console.log(`📩 [Vessel:${vessel.name}] Sending ${nextThreshold.threshold}H message`);
    const success = await sendNotificationWithRetry(phone, nextThreshold.message(vessel), vessel.name);

    if (success) {
      vessel[nextThreshold.key] = true;
      markAllPriorNotifications(vessel, nextThreshold.key, NOTIFICATION_THRESHOLDS);
    }
  }
}

/**
 * Handle vessel arrival (Infinity or normal ETA)
 */
async function handleArrival(vessel, etaHours, sog, distanceToPort) {
  if (!vessel.notified_arrival && (etaHours === Infinity || shouldMarkAsArrived(etaHours, sog, distanceToPort))) {
    const phone = normalizePhoneNumber(vessel.engineer?.phone_number);
    if (!phone) return;

    console.log(`📩 [Vessel:${vessel.name}] Sending ARRIVAL message`);
    const success = await sendNotificationWithRetry(
      phone,
      `✅ ${vessel.name} has arrived at ${vessel.port.arrival_port_name}`,
      vessel.name
    );

    if (success) {
      vessel.notified_arrival = true;
      vessel.status = "arrived";
      NOTIFICATION_THRESHOLDS.forEach((t) => (vessel[t.key] = true));

      console.log(`🚢 [Vessel:${vessel.name}] Marked as ARRIVED`);

      // Delete vessel after arrival
      await Vessel.deleteOne({ _id: vessel._id });
      console.log(`🗑️ [Vessel:${vessel.name}] Deleted from database`);
      return true; // signal deletion
    }
  }
  return false;
}

/**
 * Process a single vessel
 */
async function processVessel(vessel, latest) {
  vessel.latitude = latest.LATITUDE;
  vessel.longitude = latest.LONGITUDE;
  vessel.destination = latest.DEST;
  vessel.eta = latest.ETA;
  vessel.lastUpdated = new Date();

  const sog = Number(latest.SOG || latest.sog || latest.SPEED || 0);
  console.log(`🧭 [Vessel:${vessel.name}] Speed = ${sog} knots`);

  // Destination mismatch
  if (!isDestinationMatch(vessel.destination, vessel.port?.unlocode)) {
    console.log(`⛔ [Vessel:${vessel.name}] Destination mismatch`);
    await vessel.save();
    return;
  }

  const etaHours = computeEta(vessel, sog, vessel.port);
  const distanceToPort = calculateDistanceToPort(
    { latitude: vessel.latitude, longitude: vessel.longitude },
    vessel.port
  );

  console.log(
    `⏱ [Vessel:${vessel.name}] Final ETA: ${formatEtaHours(etaHours)} | Distance: ${distanceToPort.toFixed(2)} nm | AIS ETA raw: ${vessel.eta}`
  );

  // Handle arrival
  const deleted = await handleArrival(vessel, etaHours, sog, distanceToPort);
  if (deleted) return;

  // Handle ETA thresholds
  await handleEtaThresholdNotifications(vessel, etaHours, sog, distanceToPort);

  await vessel.save();
  console.log(`💾 [Vessel:${vessel.name}] Saved successfully`);
}

/**
 * Main update function
 */
const updateVesselsQueue = async () => {
  console.log("🚢 [Queue] Running update at", new Date().toISOString());
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
      const latest = records.find((r) => String(r.MMSI) === String(vessel.mmsi));
      if (!latest) {
        console.log(`⚠️ [Vessel:${vessel.name}] No AIS record found`);
        continue;
      }

      await processVessel(vessel, latest);
    } catch (err) {
      console.error(`❌ [Error:${vessel.name}]`, err.message);
    }
  }
};

module.exports = { updateVesselsQueue };
