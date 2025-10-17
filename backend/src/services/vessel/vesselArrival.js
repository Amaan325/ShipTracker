// src/services/vessel/vesselArrival.js
const Vessel = require("../../models/vesselModel");
const { normalizePhoneNumber } = require("../../utils/formatters");
const { enqueueMessage } = require("../queue/messageQueue");
const { shouldMarkAsArrived } = require("../etaService");

function formatGMTTime() {
  const now = new Date();
  return now.toUTCString().replace("GMT", "GMT");
  // Example: "Fri, 26 Sep 2025 16:30:00 GMT"
}

async function handleArrival(vessel, etaHours, sog, distanceToPort) {
  const vesselTag = `[Vessel:${vessel.name}]`;

  if (vessel.notified_arrival) return false;

  if (
    etaHours === Infinity ||
    shouldMarkAsArrived(etaHours, sog, distanceToPort)
  ) {
    if (!vessel.notified_zone_entry) {
      console.warn(
        `${vesselTag} ⚠️ indicates to be arrived at ${vessel.port.arrival_port_name} but has not entered the zone yet`
      );
      return false;
    }

    const engineers = Array.isArray(vessel.engineers)
      ? vessel.engineers
      : vessel.engineer
      ? [vessel.engineer]
      : [];

    if (engineers.length === 0) {
      console.warn(
        `${vesselTag} ⚠️ No engineer(s) assigned for arrival notification`
      );
      return false;
    }

    const gmtTime = formatGMTTime();

    engineers.forEach((eng) => {
      const phone = normalizePhoneNumber(eng?.phone_number);
      if (phone) {
        enqueueMessage(
          phone,
          `✅ ${vessel.name} has arrived at the ${vessel.port.arrival_port_name} on ${gmtTime}`,
          vessel.name
        );
        console.log(
          `${vesselTag} 📩 Queued ARRIVAL notification for ${eng.engineer_name}`
        );
      } else {
        console.warn(
          `${vesselTag} ⚠️ Engineer ${
            eng?.engineer_name || "N/A"
          } has no phone number`
        );
      }
    });

    vessel.notified_arrival = true;
    vessel.status = "arrived";
    vessel.isActive = false;

    // 🔥 Set expiry date to 14 days from now
    vessel.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    try {
      await vessel.save();
      console.log(
        `${vesselTag} ✅ Marked as arrived in DB (expires ${vessel.expiresAt})`
      );
    } catch (err) {
      console.error(`${vesselTag} ❌ Failed to update: ${err.message}`);
    }

    return true;
  }

  return false;
}

module.exports = { handleArrival };
