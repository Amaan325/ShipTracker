// services/etaService.js
const {
  ARRIVAL_THRESHOLD_HOURS,
  ARRIVAL_SPEED_THRESHOLD,
  MIN_SPEED_FOR_ETA_CALC,
} = require("../../config/notificationConfig");
const { calculateEtaHours, calculateDistanceToPort } = require("../utils/eta");

// Arrival radius (nm) — tuned to your environment
const ARRIVAL_RADIUS_NM = 3;

/**
 * Return true when vessel should be considered arrived
 * Requires BOTH closeEnough (distance or very small ETA) AND slowEnough.
 */
function shouldMarkAsArrived(etaHours, sog, distanceToPort) {
  const closeEnough =
    (typeof etaHours === "number" && etaHours <= ARRIVAL_THRESHOLD_HOURS) ||
    (typeof distanceToPort === "number" && distanceToPort <= ARRIVAL_RADIUS_NM);

  const slowEnough = Number.isFinite(sog) && sog <= ARRIVAL_SPEED_THRESHOLD;
  return closeEnough && slowEnough;
}

/**
 * Whether the calculated ETA (distance/speed) is reliable
 */
function isEtaCalculationReliable(sog, distanceToPort) {
  return (
    Number.isFinite(sog) &&
    sog > MIN_SPEED_FOR_ETA_CALC &&
    typeof distanceToPort === "number" &&
    distanceToPort > ARRIVAL_RADIUS_NM
  );
}

/**
 * Compute ETA in hours for a vessel & port.
 * Preference order:
 *  1) Use AIS-provided ETA (if valid, in future, and reasonable)
 *  2) Use haversine distance / speed if the calculation is reliable
 *  3) Fallback to distance/sog rough or Infinity if sog == 0
 */
function computeEta(vessel, sog, port) {
  if (vessel.eta && String(vessel.eta).trim() !== "") {
    const rawEta = String(vessel.eta).trim(); // e.g. "09-05 00:01"

    try {
      const year = new Date().getUTCFullYear();

      // Split "09-05 00:01" into [month, day] and [HH, mm]
      const [datePart, timePart] = rawEta.split(" ");
      const [month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);

      // Force UTC date
      const etaDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const hours = (etaDate.getTime() - Date.now()) / (1000 * 60 * 60);

      const vesselTag = vessel?.name ? `[Vessel:${vessel.name}]` : "[Vessel]";
      console.log(
        `${vesselTag} 📡 AIS ETA raw: ${rawEta} | UTC ETA hours: ${hours.toFixed(
          2
        )}h`
      );

      if (hours > 0 && hours < 1000) {
        return hours;
      }
    } catch (err) {
      const vesselTag = vessel?.name ? `[Vessel:${vessel.name}]` : "[Vessel]";
      console.warn(`${vesselTag} ⚠️ Failed to parse AIS ETA: ${rawEta}`);
    }
  }

  return Infinity; // No valid AIS ETA
}

module.exports = {
  shouldMarkAsArrived,
  isEtaCalculationReliable,
  computeEta,
  calculateDistanceToPort,
};
