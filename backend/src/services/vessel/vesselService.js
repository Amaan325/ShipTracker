// src/services/vessel/vesselService.js
const { updateVesselsQueue } = require("./vesselQueueProcessor");
const { processVessel } = require("./vesselProcessor");
const { handleArrival } = require("./vesselArrival");

module.exports = { updateVesselsQueue, processVessel, handleArrival };
