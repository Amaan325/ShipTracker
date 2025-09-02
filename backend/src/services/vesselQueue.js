const Vessel = require("../models/vesselModel");

let vesselQueue = [];
let allVessels = [];
let queueInitialized = false;
let failedBatches = []; // store failed batches temporarily

/**
 * Initialize or refresh the queue with all active vessels
 */
const initVesselQueue = async () => {
  const vessels = await Vessel.find({ isActive: true }).select("mmsi");
  allVessels = vessels.map(v => v.mmsi);

  if (!queueInitialized) {
    vesselQueue = [...allVessels];
    queueInitialized = true;
    console.log(`🚢 Vessel queue initialized with ${vesselQueue.length} ships`);
  } else if (vesselQueue.length === 0) {
    vesselQueue = [...allVessels];
    console.log(`♻️ Vessel queue refreshed with ${vesselQueue.length} ships`);
  }
};

/**
 * Get the next batch of MMSIs from the queue
 */
const getNextBatch = (batchSize = 50) => {
  if (vesselQueue.length === 0) {
    console.log("♻️ All batches processed, restarting queue...");
    vesselQueue = [...allVessels];
  }

  const batch = vesselQueue.slice(0, batchSize);
  vesselQueue = vesselQueue.slice(batchSize);

  const batchNumber = Math.ceil((allVessels.length - vesselQueue.length) / batchSize);
  const totalBatches = Math.ceil(allVessels.length / batchSize);

  console.log(
    `📦 Processing batch ${batchNumber} of ${totalBatches} (${batch.length} ships). ` +
    `Ships left in queue: ${vesselQueue.length}. Failed batches waiting: ${failedBatches.length}`
  );

  return batch;
};

/**
 * Requeue failed batch at end
 */
const requeueBatch = (batch) => {
  vesselQueue.push(...batch);
  failedBatches.push(batch);
  console.log(`🔁 Failed batch requeued at the end (${batch.length} ships). Total failed batches: ${failedBatches.length}`);
};

/**
 * Remove batch from failedBatches once successfully processed
 */
const removeFailedBatch = (batch) => {
  failedBatches = failedBatches.filter(f => !batch.every(mmsi => f.includes(mmsi)));
};

module.exports = { initVesselQueue, getNextBatch, requeueBatch, removeFailedBatch };
