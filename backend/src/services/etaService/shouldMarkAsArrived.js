const {
  ARRIVAL_THRESHOLD_HOURS,
  ARRIVAL_SPEED_THRESHOLD,
} = require("../../../config/notificationConfig");

const ARRIVAL_RADIUS_NM = 3;

/**
 * Return true when vessel should be considered arrived
 */
function shouldMarkAsArrived(etaHours, sog, distanceToPort) {
  const closeEnough =
    (typeof etaHours === "number" && etaHours <= ARRIVAL_THRESHOLD_HOURS) ||
    (typeof distanceToPort === "number" && distanceToPort <= ARRIVAL_RADIUS_NM);

  const slowEnough = Number.isFinite(sog) && sog <= ARRIVAL_SPEED_THRESHOLD;
  return closeEnough && slowEnough;
}

module.exports = { shouldMarkAsArrived };
