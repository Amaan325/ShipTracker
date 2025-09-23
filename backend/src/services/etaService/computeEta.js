const { MIN_SPEED_FOR_ETA_CALC } = require("../../../config/notificationConfig");
const { computeEtaFromSpeedAndDistance } = require("./computeEtaFromSpeedAndDistance");

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

  try {
    // numeric-like input (could be ms / sec / min or AISHub special)
    if (typeof rawEta === "number" || /^\d+$/.test(String(rawEta).trim())) {
      const n = Number(rawEta);
      let etaDate = null;

      if (n > 1e12) {
        etaDate = new Date(n); // ms
      } else if (n > 1e9) {
        etaDate = new Date(n * 1000); // seconds
      } else if (n > 1e6) {
        etaDate = new Date(n * 60 * 1000); // minutes
      } else {
        // fallback: interpret as MMDDHHMM
        const s = String(n).padStart(8, "0");
        const maybeMonth = Number(s.slice(0, 2));
        const maybeDay = Number(s.slice(2, 4));
        const maybeHour = Number(s.slice(4, 6));
        const maybeMinute = Number(s.slice(6, 8));
        const year = new Date().getUTCFullYear();

        if (maybeMonth >= 1 && maybeMonth <= 12 && maybeDay >= 1 && maybeDay <= 31) {
          etaDate = new Date(Date.UTC(year, maybeMonth - 1, maybeDay, maybeHour, maybeMinute));
          const thirtyDaysMs = 30 * 24 * 3600 * 1000;
          if (etaDate.getTime() < Date.now() - thirtyDaysMs) {
            etaDate = new Date(Date.UTC(year + 1, maybeMonth - 1, maybeDay, maybeHour, maybeMinute));
          }
        }
      }

      if (etaDate instanceof Date && !Number.isNaN(etaDate.getTime())) {
        const hours = toHours(etaDate);
        if (hours > 0 && hours < 1000) return hours;
      }
    }

    // VF pattern: "MM-DD HH:mm"
    if (typeof rawEta === "string") {
      const s = rawEta.trim();
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
        }
        const hours = toHours(etaDate);
        if (hours > 0 && hours < 1000) return hours;
      }

      const isoDate = new Date(s);
      if (!Number.isNaN(isoDate.getTime())) {
        const hours = toHours(isoDate);
        if (hours > 0 && hours < 1000) return hours;
      }
    }
  } catch (err) {
    console.warn(`${vesselTag} ⚠️ Error while parsing ETA: ${rawEta}`, err);
  }

  // fallback: distance / speed
  return computeEtaFromSpeedAndDistance(vessel, sog, port);
}

module.exports = { computeEta };
