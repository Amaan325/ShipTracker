// src/services/vesselService.js
const Vessel = require("../models/vesselModel");
const { fetchAISDataForBatch } = require("./aisService");
const {
  getNextBatch,
  requeueBatch,
  initVesselQueue,
  removeFailedBatch,
} = require("./vesselQueue");
const {
  ZONE_ENTRY_NOTIFICATION,
  NOTIFICATION_THRESHOLDS,
} = require("../../config/notificationConfig");
const {
  normalizePhoneNumber,
  formatEtaHours,
} = require("../utils/formatters");
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
 * Merge AIS API fields into vessel document
 */
function mergeAISFields(vessel, aisData) {
  const map = {
    MMSI: "mmsi",
    IMO: "imo",
    NAME: "name",
    CALLSIGN: "callsign",
    NAVSTAT: "navigationStatus",
    SOG: "sog",
    LATITUDE: "latitude",
    LONGITUDE: "longitude",
    DEST: "destination",
    ETA: "eta",
    TIME: "lastUpdated",
    TYPE: "type",
    HEADING: "heading",
    COG: "cog",
    ROT: "rateOfTurn",
    A: "dimA",
    B: "dimB",
    C: "dimC",
    D: "dimD",
    DRAUGHT: "draught",
  };

  for (const [src, dest] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(aisData, src)) {
      vessel[dest] = aisData[src];
    }
  }

  vessel.lastUpdated = new Date();
  return vessel;
}

/**
 * Fetch AIS records with retries and structured logging
 */
async function fetchAISRecords(batchMMSIs, batchNumber = 1) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `[AIS][Batch ${batchNumber}] Attempt ${attempt} for ${batchMMSIs.length} ships`
      );
      const records = await fetchAISDataForBatch(batchMMSIs);

      if (records && records.length > 0) {
        console.log(
          `[AIS][Batch ${batchNumber}] ✅ Successfully fetched ${records.length} records`
        );
        return records;
      }

      const delay = Math.min(1000 * 2 ** attempt, 30000);
      console.warn(
        `[AIS][Batch ${batchNumber}] ⚠️ No records, retrying in ${
          delay / 1000
        }s`
      );
      await new Promise((r) => setTimeout(r, delay));
    } catch (err) {
      console.error(
        `[AIS][Batch ${batchNumber}] ❌ Fetch error: ${err.message}`
      );
      if (err.message.includes("Too frequent requests")) {
        console.warn(`[AIS][Batch ${batchNumber}] ⏳ Rate limited, waiting 60s`);
        await new Promise((r) => setTimeout(r, 60000));
      }
    }
  }
  console.error(`[AIS][Batch ${batchNumber}] ❌ Max retries reached`);
  return [];
}

/**
 * Queue vessel arrival notification (once only)
 */
async function handleArrival(vessel, etaHours, sog, distanceToPort) {
  const vesselTag = `[Vessel:${vessel.name}]`;

  if (vessel.notified_arrival) return false;

  if (
    etaHours === Infinity ||
    shouldMarkAsArrived(etaHours, sog, distanceToPort)
  ) {
    const phone = normalizePhoneNumber(vessel.engineer?.phone_number);
    if (!phone) {
      console.warn(
        `${vesselTag} ⚠️ No engineer phone number for arrival notification`
      );
      return false;
    }

    console.log(`${vesselTag} 📩 Queuing ARRIVAL notification`);
    enqueueMessage(
      phone,
      `✅ ${vessel.name} has arrived at ${vessel.port.arrival_port_name}`,
      vessel.name
    );

    vessel.notified_arrival = true;
    vessel.status = "arrived";

    try {
      await Vessel.deleteOne({ _id: vessel._id });
      console.log(`${vesselTag} 🗑️ Deleted from database (Arrived)`);
    } catch (err) {
      console.error(`${vesselTag} ❌ Failed to delete: ${err.message}`);
    }

    return true;
  }
  return false;
}

/**
 * Process and update a single vessel
 */
async function processVessel(vessel, latest) {
  const vesselTag = `[Vessel:${vessel.name}]`;

  console.log(`[AIS RAW] ${JSON.stringify(latest)}`);

  // Merge all AIS data fields into vessel doc
  mergeAISFields(vessel, latest);

  const sog = Number(latest.SOG || 0);
  const cog = Number(latest.COG || 0);
  console.log(`${vesselTag} 🧭 Speed: ${sog}kn | Course: ${cog}°`);

  // Destination check
  if (!isDestinationMatch(vessel.destination, vessel.port?.unlocode)) {
    console.warn(`${vesselTag} ⛔ Destination mismatch. Skipping update.`);
    await vessel.save();
    return;
  }

  // Compute ETA & distance
  const etaHours = computeEta(vessel, sog, vessel.port);
  const distanceToPort = calculateDistanceToPort(
    { latitude: vessel.latitude, longitude: vessel.longitude },
    vessel.port
  );

  console.log(
    `${vesselTag} ⏱ ETA: ${formatEtaHours(
      etaHours
    )} | Distance: ${distanceToPort.toFixed(1)}nm | AIS ETA: ${vessel.eta}`
  );

  const phone = normalizePhoneNumber(vessel.engineer?.phone_number);

  // Zone entry notification
  if (
    !vessel[ZONE_ENTRY_NOTIFICATION.key] &&
    distanceToPort <= ZONE_ENTRY_NOTIFICATION.radiusNm
  ) {
    if (phone) {
      enqueueMessage(phone, ZONE_ENTRY_NOTIFICATION.message(vessel), vessel.name);
      vessel[ZONE_ENTRY_NOTIFICATION.key] = true;
      console.log(`${vesselTag} 📩 Zone entry notification sent`);

      // Auto-mark higher thresholds
      const zoneThresholdIndex = NOTIFICATION_THRESHOLDS.findIndex(
        (t) => t.threshold >= 6
      );
      if (zoneThresholdIndex >= 0) {
        for (let j = zoneThresholdIndex; j < NOTIFICATION_THRESHOLDS.length; j++) {
          const higher = NOTIFICATION_THRESHOLDS[j];
          if (!vessel[higher.key]) {
            vessel[higher.key] = true;
            console.log(`${vesselTag} ✅ Auto-marked ${higher.threshold}h as notified`);
          }
        }
      }
    }
  }

  // Arrival handling
  const deleted = await handleArrival(vessel, etaHours, sog, distanceToPort);
  if (deleted) return;

  // Notification checks
  if (phone) {
    await checkAndQueueNotification(vessel, etaHours);
  }

  // Save vessel
  try {
    await vessel.save();
    console.log(`${vesselTag} 💾 Saved successfully`);
  } catch (err) {
    console.error(`${vesselTag} ❌ Failed to save: ${err.message}`);
  }
}

/**
 * Main AIS update queue processor
 */
const updateVesselsQueue = async () => {
  const start = Date.now();
  console.log(`[Queue] 🚢 Starting AIS update at ${new Date().toISOString()}`);

  await initVesselQueue();

  const batchMMSIs = getNextBatch(BATCH_SIZE);
  if (!batchMMSIs.length) {
    console.log(`[Queue] ℹ️ No vessels in queue.`);
    return;
  }

  console.log(`[Queue] 📦 Processing ${batchMMSIs.length} vessels in this batch`);

  const records = await fetchAISRecords(batchMMSIs, 1);
  if (!records.length) {
    console.error(`[Queue] ❌ No AIS data received. Re-queueing batch.`);
    requeueBatch(batchMMSIs);
    return;
  }

  removeFailedBatch(batchMMSIs);

  const vessels = await Vessel.find({ mmsi: { $in: batchMMSIs } })
    .populate("port")
    .populate("engineer");

  console.log(`[Queue] 🌊 Updating ${vessels.length} vessels`);

  for (const vessel of vessels) {
    try {
      const latest = records.find(
        (r) => String(r.MMSI) === String(vessel.mmsi)
      );
      if (!latest) {
        console.warn(`[Vessel:${vessel.name}] ⚠️ No AIS record found`);
        continue;
      }
      await processVessel(vessel, latest);
    } catch (err) {
      console.error(
        `[Vessel:${vessel.name}] ❌ Processing failed: ${err.message}`
      );
    }
  }

  console.log(`[Queue] ✅ AIS update completed in ${(Date.now() - start) / 1000}s`);
};

module.exports = { updateVesselsQueue, processVessel, handleArrival };