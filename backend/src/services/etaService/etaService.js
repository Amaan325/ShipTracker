const { shouldMarkAsArrived } = require("./shouldMarkAsArrived");
const { computeEta } = require("./computeEta");
const { computeEtaFromSpeedAndDistance } = require("./computeEtaFromSpeedAndDistance");
const { calculateDistanceToPort } = require("../../utils/eta");

module.exports = {
  shouldMarkAsArrived,
  computeEta,
  computeEtaFromSpeedAndDistance,
  calculateDistanceToPort,
};
