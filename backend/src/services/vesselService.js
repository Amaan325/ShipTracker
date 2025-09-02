const Vessel = require("../models/vesselModel");
const { fetchAISDataForBatch } = require("./aisService");
const { sendWhatsAppNotification } = require("./notify");
const { calculateEtaHours } = require("../utils/eta");
const { getNextBatch, requeueBatch, initVesselQueue, removeFailedBatch } = require("./vesselQueue");

const BATCH_SIZE = 50;
const MAX_RETRIES = 5;

/**
 * Update vessels for the next batch in the queue
 */
const updateVesselsQueue = async () => {
  console.log("🚢 Running vessel queue update at", new Date().toISOString());

  // Ensure queue is initialized or refreshed
  await initVesselQueue();

  // Get next batch from the queue
  const batchMMSIs = getNextBatch(BATCH_SIZE);
  if (!batchMMSIs.length) return;

  let attempt = 0;
  let records = [];

  // Retry loop with exponential backoff
  while (attempt < MAX_RETRIES) {
    attempt++;
    records = await fetchAISDataForBatch(batchMMSIs);

    if (records.length) break; // success

    const delay = Math.min(1000 * 2 ** attempt, 30000); // capped at 30s
    console.warn(`⚠️ AIS fetch failed for batch (attempt ${attempt}). Retrying in ${delay / 1000}s...`);
    await new Promise(res => setTimeout(res, delay));
  }

  if (!records.length) {
    console.error("❌ Batch failed after max retries, re-queueing at end");
    requeueBatch(batchMMSIs);
    return;
  }

  // Remove from failedBatches if this batch was previously failing
  removeFailedBatch(batchMMSIs);

  // Fetch vessels from DB
  const vessels = await Vessel.find({ mmsi: { $in: batchMMSIs } })
    .populate("port")
    .populate("engineer");

  console.log(`🌊 Updating ${vessels.length} vessels from batch`);

  // Update vessels
  await Promise.all(
    vessels.map(async (vessel) => {
      try {
        const latest = records.find(r => String(r.MMSI) === String(vessel.mmsi));
        if (!latest) return;

        vessel.latitude = latest.LATITUDE;
        vessel.longitude = latest.LONGITUDE;
        vessel.destination = latest.DEST;
        vessel.eta = latest.ETA;

        if (vessel.destination && vessel.port &&
            vessel.destination.toLowerCase().includes(vessel.port.arrival_port_name.toLowerCase())) {
          const etaHours = calculateEtaHours(latest, vessel.port);

          if (etaHours <= 48 && !vessel.notified_48h) {
            await sendWhatsAppNotification(vessel.engineer.phone_number,
              `${vessel.name} is 48 hours away from ${vessel.port.arrival_port_name}`);
            vessel.notified_48h = true;
          }
          if (etaHours <= 24 && !vessel.notified_24h) {
            await sendWhatsAppNotification(vessel.engineer.phone_number,
              `${vessel.name} is 24 hours away from ${vessel.port.arrival_port_name}`);
            vessel.notified_24h = true;
          }
          if (etaHours <= 1 && !vessel.notified_arrival) {
            await sendWhatsAppNotification(vessel.engineer.phone_number,
              `${vessel.name} has arrived at ${vessel.port.arrival_port_name}`);
            vessel.notified_arrival = true;
            vessel.status = "arrived";
          }
        }

        await vessel.save();
        console.log(`✅ Updated vessel: ${vessel.name}`);
      } catch (err) {
        console.error(`❌ Error updating vessel ${vessel.name}:`, err.message);
      }
    })
  );
};

module.exports = { updateVesselsQueue };
