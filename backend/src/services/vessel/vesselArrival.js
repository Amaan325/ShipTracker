// src/services/vessel/vesselArrival.js
const Vessel = require("../../models/vesselModel");
const { normalizePhoneNumber } = require("../../utils/formatters");
const { enqueueMessage } = require("../queue/messageQueue");
const { shouldMarkAsArrived } = require("../etaService");

async function handleArrival(vessel, etaHours, sog, distanceToPort) {
  const vesselTag = `[Vessel:${vessel.name}]`;

  if (vessel.notified_arrival) return false;

  if (
    etaHours === Infinity ||
    shouldMarkAsArrived(etaHours, sog, distanceToPort)
  ) {
    // ✅ Check if zone entry notification was sent
    if (!vessel.notified_zone_entry) {
      console.warn(
        `${vesselTag} ⚠️ indicates to be arrived at ${vessel.port.arrival_port_name} but has not entered the zone yet`
      );
      return false;
    }

    // ✅ Handle multiple engineers
    const engineers = Array.isArray(vessel.engineers)
      ? vessel.engineers
      : vessel.engineer
      ? [vessel.engineer]
      : [];

    if (engineers.length === 0) {
      console.warn(`${vesselTag} ⚠️ No engineer(s) assigned for arrival notification`);
      return false;
    }

    // Send arrival notification to all engineers
    engineers.forEach((eng) => {
      const phone = normalizePhoneNumber(eng?.phone_number);
      if (phone) {
        enqueueMessage(
          phone,
          `✅ ${vessel.name} has arrived at ${vessel.port.arrival_port_name}`,
          vessel.name
        );
        console.log(`${vesselTag} 📩 Queued ARRIVAL notification for ${eng.engineer_name}`);
      } else {
        console.warn(`${vesselTag} ⚠️ Engineer ${eng?.engineer_name || "N/A"} has no phone number`);
      }
    });

    vessel.notified_arrival = true;
    vessel.status = "arrived"; // ✅ mark completed/arrived
    vessel.isActive = false;   // optional: mark inactive

    try {
      await vessel.save();
      console.log(`${vesselTag} ✅ Marked as arrived in DB`);
    } catch (err) {
      console.error(`${vesselTag} ❌ Failed to update: ${err.message}`);
    }

    return true;
  }

  return false;
}

module.exports = { handleArrival };
