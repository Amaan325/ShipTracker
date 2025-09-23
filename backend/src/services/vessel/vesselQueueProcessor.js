// src/services/vessel/vesselQueueProcessor.js
const Vessel = require("../../models/vesselModel");
const { fetchAISDataForBatch } = require("../aisService");
const { getNextBatch, initVesselQueue, removeFailedBatch } = require("../queue/vesselQueue");
const { processVessel } = require("./vesselProcessor");

const BATCH_SIZE = 50;

const updateVesselsQueue = async () => {
  const start = Date.now();
  console.log(`[Queue] 🚢 Starting AIS update at ${new Date().toISOString()}`);

  await initVesselQueue();

  const batchMMSIs = getNextBatch(BATCH_SIZE);
  if (!batchMMSIs.length) {
    console.log(`[Queue] ℹ️ No vessels in queue.`);
    return;
  }

  const vessels = await Vessel.find({ mmsi: { $in: batchMMSIs } })
    .populate("port")
    .populate("engineer");

  console.log(`[Queue] 📦 Processing ${vessels.length} vessels in this batch`);

  const { aisDataMap, failedVessels } = await fetchAISDataForBatch(vessels);

  removeFailedBatch(batchMMSIs);

  for (const vessel of vessels) {
    const latest = aisDataMap.get(vessel.mmsi);
    if (!latest) {
      console.warn(`[Vessel:${vessel.name}] ⚠️ No AIS or VF data found`);
      continue;
    }

    try {
      await processVessel(vessel, latest);
    } catch (err) {
      console.error(`[Vessel:${vessel.name}] ❌ Processing failed: ${err.message}`);
    }
  }

  console.log(`[Queue] ✅ AIS update completed in ${(Date.now() - start) / 1000}s`);
};

module.exports = { updateVesselsQueue };
