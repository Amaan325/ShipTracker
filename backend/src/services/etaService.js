// services/etaService.js
const {
  ARRIVAL_THRESHOLD_HOURS,
  ARRIVAL_SPEED_THRESHOLD,
  MIN_SPEED_FOR_ETA_CALC,
} = require("../../config/notificationConfig");
const { calculateDistanceToPort } = require("../utils/eta");

const ARRIVAL_RADIUS_NM = 3;
const RECENT_PAST_WINDOW_HOURS = -6; // how far back we still accept ETA as "arrived"

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

/**
 * Compute ETA (hours). Robustly handles:
 * - VesselFinder strings "MM-DD HH:mm" or ISO dates,
 * - numeric timestamps (ms / seconds / minutes),
 * - AISHub integer formats (best-effort),
 * - fallback to distance / SOG calculation (distance in nm / speed in kn).
 *
 * Returns a Number (hours) or Infinity if not computable.
 */
function computeEta(vessel, sog, port) {
  const vesselTag = vessel?.name ? `[Vessel:${vessel.name}]` : "[Vessel]";
  const rawEta = vessel?.eta;

  // Helper: compute hours from Date
  const toHours = (date) => (date.getTime() - Date.now()) / (1000 * 60 * 60);

  // 1) If no raw ETA, try distance/speed fallback
  if (rawEta == null || String(rawEta).trim() === "") {
    console.log(`${vesselTag} ❌ No ETA provided — will compute from position/speed if possible`);
    return computeEtaFromSpeedAndDistance(vessel, sog, port);
  }

  // 2) Try types/format detection
  try {
    // numeric-like input (could be ms / sec / min or AISHub special)
    if (typeof rawEta === "number" || /^\d+$/.test(String(rawEta).trim())) {
      const etaDate = parseNumericEta(vesselTag, rawEta);
      if (etaDate) {
        const hours = toHours(etaDate);
        console.log(`${vesselTag} 📏 Hours until arrival: ${hours.toFixed(2)}`);

        if (hours > 0 && hours < 1000) return hours;

        // NEW: accept recent past ETAs as "arrived"
        if (hours <= 0 && hours > RECENT_PAST_WINDOW_HOURS) {
          console.log(`${vesselTag} ✅ ETA is in the past but recent — treating as arrived`);
          return 0;
        }
      }
    }

    // 3) If rawEta is a string pattern like "MM-DD HH:mm"
    if (typeof rawEta === "string") {
      const etaDate = parseStringEta(vesselTag, rawEta);
      if (etaDate) {
        const hours = toHours(etaDate);
        console.log(`${vesselTag} 📏 Hours until arrival: ${hours.toFixed(2)}`);

        if (hours > 0 && hours < 1000) return hours;

        // NEW: accept recent past ETAs as "arrived"
        if (hours <= 0 && hours > RECENT_PAST_WINDOW_HOURS) {
          console.log(`${vesselTag} ✅ ETA is in the past but recent — treating as arrived`);
          return 0;
        }
      }
    }
  } catch (err) {
    console.warn(`${vesselTag} ⚠️ Error while parsing ETA: ${rawEta}`, err);
  }

  // 4) Fallback: distance / speed calculation (reliable when sog > MIN_SPEED)
  return computeEtaFromSpeedAndDistance(vessel, sog, port);
}

/**
 * Parse numeric ETA formats
 */
function parseNumericEta(vesselTag, rawEta) {
  const n = Number(rawEta);

  if (n > 1e12) {
    const etaDate = new Date(n);
    console.log(`${vesselTag} ⏱ Parsed numeric ETA as ms timestamp: ${etaDate.toUTCString()}`);
    return etaDate;
  } else if (n > 1e9) {
    const etaDate = new Date(n * 1000);
    console.log(`${vesselTag} ⏱ Parsed numeric ETA as seconds timestamp: ${etaDate.toUTCString()}`);
    return etaDate;
  } else if (n > 1e6) {
    const etaDate = new Date(n * 60 * 1000);
    console.log(`${vesselTag} ⏱ Parsed numeric ETA as minutes-since-epoch: ${etaDate.toUTCString()}`);
    return etaDate;
  } else {
    const s = String(n).padStart(8, "0");
    const maybeMonth = Number(s.slice(0, 2));
    const maybeDay = Number(s.slice(2, 4));
    const maybeHour = Number(s.slice(4, 6));
    const maybeMinute = Number(s.slice(6, 8));
    const year = new Date().getUTCFullYear();

    if (maybeMonth >= 1 && maybeMonth <= 12 && maybeDay >= 1 && maybeDay <= 31) {
      let etaDate = new Date(Date.UTC(year, maybeMonth - 1, maybeDay, maybeHour, maybeMinute));
      const thirtyDaysMs = 30 * 24 * 3600 * 1000;
      if (etaDate.getTime() < Date.now() - thirtyDaysMs) {
        etaDate = new Date(Date.UTC(year + 1, maybeMonth - 1, maybeDay, maybeHour, maybeMinute));
        console.log(`${vesselTag} 🔄 Rolled ETA into next year: ${etaDate.toUTCString()}`);
      } else {
        console.log(`${vesselTag} ⏱ Parsed numeric ETA as MMDDHHMM-ish: ${etaDate.toUTCString()}`);
      }
      return etaDate;
    }
  }
  return null;
}

/**
 * Parse string ETA formats
 */
function parseStringEta(vesselTag, s) {
  const mmddPattern = /^\d{2}-\d{2}\s\d{2}:\d{2}$/;
  if (mmddPattern.test(s)) {
    const year = new Date().getUTCFullYear();
    const [datePart, timePart] = s.split(" ");
    const [month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    let etaDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const thirtyDaysMs = 30 * 24 * 3600 * 1000;
    if (etaDate.getTime() < Date.now() - thirtyDaysMs) {
      etaDate = new Date(Date.UTC(year + 1, month - 1, day, hour, minute));
      console.log(`${vesselTag} 🔄 Rolled MM-DD ETA to next year: ${etaDate.toUTCString()}`);
    } else {
      console.log(`${vesselTag} ⏱ Parsed VF ETA (MM-DD HH:mm): ${etaDate.toUTCString()}`);
    }
    return etaDate;
  }

  const isoDate = new Date(s);
  if (!Number.isNaN(isoDate.getTime())) {
    console.log(`${vesselTag} ⏱ Parsed ETA as ISO: ${isoDate.toUTCString()}`);
    return isoDate;
  }

  return null;
}

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

  if (!Number.isFinite(sog) || sog <= 0) {
    console.log(`${vesselTag} 📏 Can't compute ETA from speed (SOG=${sog}); returning Infinity`);
    return Infinity;
  }

  const hours = distanceToPort / sog; // distance (nm) / speed (kn) = hours
  console.log(`${vesselTag} 📡 ETA(calc): ${hours.toFixed(2)} hours | Distance: ${distanceToPort.toFixed(1)}nm`);
  return hours;
}

module.exports = {
  shouldMarkAsArrived,
  computeEta,
  calculateDistanceToPort,
};
