const { calculateDistanceToPort } = require("../../utils/eta");
const { MIN_SPEED_FOR_ETA_CALC } = require("../../../config/notificationConfig");

/**
 * Compute ETA from distance and speed (distance in nm / speed in knots -> hours).
 * Returns Infinity if sog is 0 or distance can't be computed.
 */
function computeEtaFromSpeedAndDistance(vessel, sog, port) {
  const vesselTag = vessel?.name ? `[Vessel:${vessel.name}]` : "[Vessel]";

  if (!port || (typeof port.lat !== "number" && typeof port.latitude !== "number")) {
    console.warn(`${vesselTag} ⚠️ No port coordinates available for distance calculation`);
    return Infinity;
  }

  const distanceToPort = calculateDistanceToPort(
    { latitude: vessel.latitude, longitude: vessel.longitude },
    port
  );

  if (!Number.isFinite(sog) || sog <= MIN_SPEED_FOR_ETA_CALC) {
    console.log(`${vesselTag} 📏 Can't compute ETA from speed (SOG=${sog}); returning Infinity`);
    return Infinity;
  }

  const hours = distanceToPort / sog; // distance (nm) / speed (kn) = hours
  console.log(
    `${vesselTag} 📡 ETA(calc): ${hours.toFixed(2)} hours | Distance: ${distanceToPort.toFixed(1)}nm`
  );
  return hours;
}

module.exports = { computeEtaFromSpeedAndDistance };
