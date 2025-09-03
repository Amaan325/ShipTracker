// vesselService.js

const Vessel = require("../models/vesselModel");
const { fetchAISDataForBatch } = require("./aisService");
const { sendWhatsAppNotification } = require("./notify");
const { calculateEtaHours } = require("../utils/eta");
const {
  getNextBatch,
  requeueBatch,
  initVesselQueue,
  removeFailedBatch,
} = require("./vesselQueue");

const BATCH_SIZE = 50;
const MAX_RETRIES = 5;

// Helper: check if ETA is close to a target threshold (e.g. 48h, 24h)
function isCloseToTarget(etaHours, target, tolerance = 0.5) {
  return Math.abs(etaHours - target) <= tolerance;
}

// Helper: normalize phone number (remove leading +)
function normalizePhoneNumber(phone) {
  if (!phone) return "";
  return phone.replace(/^\+/, "");
}

/**
 * Update vessels for the next batch in the queue
 */
const updateVesselsQueue = async () => {
  console.log("🚢 Running vessel queue update at", new Date().toISOString());

  await initVesselQueue();

  const batchMMSIs = getNextBatch(BATCH_SIZE);
  if (!batchMMSIs.length) return;

  let attempt = 0;
  let records = [];

  while (attempt < MAX_RETRIES) {
    attempt++;
    records = await fetchAISDataForBatch(batchMMSIs);

    if (records.length) break;

    const delay = Math.min(1000 * 2 ** attempt, 30000);
    console.warn(
      `⚠️ AIS fetch failed for batch (attempt ${attempt}). Retrying in ${
        delay / 1000
      }s...`
    );
    await new Promise((res) => setTimeout(res, delay));
  }

  if (!records.length) {
    console.error("❌ Batch failed after max retries, re-queueing at end");
    requeueBatch(batchMMSIs);
    return;
  }

  removeFailedBatch(batchMMSIs);

  const vessels = await Vessel.find({ mmsi: { $in: batchMMSIs } })
    .populate("port")
    .populate("engineer");

  console.log(`🌊 Updating ${vessels.length} vessels from batch`);

  await Promise.all(
    vessels.map(async (vessel) => {
      try {
        const latest = records.find(
          (r) => String(r.MMSI) === String(vessel.mmsi)
        );
        if (!latest) {
          console.log(`⚠️ No latest AIS record found for ${vessel.name}`);
          return;
        }

        vessel.latitude = latest.LATITUDE;
        vessel.longitude = latest.LONGITUDE;
        vessel.destination = latest.DEST;
        vessel.eta = latest.ETA;

        console.log(
          `📍 ${vessel.name} position updated: lat=${latest.LATITUDE}, lon=${latest.LONGITUDE}, dest="${latest.DEST}", eta=${latest.ETA}`
        );

        let destMatches = false;
        if (vessel.destination && vessel.port?.unlocode) {
          if (
            vessel.destination.trim().toLowerCase() ===
            vessel.port.unlocode.trim().toLowerCase()
          ) {
            destMatches = true;
            console.log(
              `✅ UNLOCODE match for ${vessel.name}: AIS dest="${vessel.destination}", expected="${vessel.port.unlocode}"`
            );
          } else {
            console.log(
              `⛔ UNLOCODE mismatch for ${vessel.name}: AIS dest="${vessel.destination}", expected="${vessel.port.unlocode}"`
            );
          }
        }

        if (destMatches) {
          const etaHours = calculateEtaHours(
            {
              latitude: latest.LATITUDE,
              longitude: latest.LONGITUDE,
              sog: latest.SOG,
            },
            vessel.port
          );

          console.log(`⏱ ETA for ${vessel.name}: ~${etaHours.toFixed(2)} hours`);

          const phone = normalizePhoneNumber(vessel.engineer.phone_number);

          // 48-hour message
          if (etaHours <= 48 && !vessel.notified_48h) {
            await sendWhatsAppNotification(
              phone,
              `⏳ ${vessel.name} is approximately 48 hours away from ${vessel.port.arrival_port_name}`
            );
            vessel.notified_48h = true;
            console.log(`📩 48h message sent for ${vessel.name}`);
          }

          // 24-hour message
          if (etaHours <= 24 && etaHours > 1 && !vessel.notified_24h) {
            await sendWhatsAppNotification(
              phone,
              `⚓ ${vessel.name} is approximately 24 hours away from ${vessel.port.arrival_port_name}`
            );
            vessel.notified_24h = true;
            console.log(`📩 24h message sent for ${vessel.name}`);
          }

          // Arrival message
          if (etaHours <= 1 && !vessel.notified_arrival) {
            await sendWhatsAppNotification(
              phone,
              `✅ ${vessel.name} has arrived at ${vessel.port.arrival_port_name}`
            );
            vessel.notified_arrival = true;
            vessel.status = "arrived";
            console.log(`📩 Arrival message sent for ${vessel.name}`);
          }
        }

        await vessel.save();
        console.log(`✅ Vessel saved: ${vessel.name}`);
      } catch (err) {
        console.error(`❌ Error updating vessel ${vessel.name}:`, err.message);
      }
    })
  );
};

module.exports = { updateVesselsQueue };
