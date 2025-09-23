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

    const phone = normalizePhoneNumber(vessel.engineer?.phone_number);
    if (!phone) {
      console.warn(
        `${vesselTag} ⚠️ No engineer phone number for arrival notification`
      );
      return false;
    }

    console.log(`${vesselTag} 📩 Queuing ARRIVAL notification`);
    enqueueMessage(
      phone,
      `✅ ${vessel.name} has arrived at ${vessel.port.arrival_port_name}`,
      vessel.name
    );

    vessel.notified_arrival = true;
    vessel.status = "arrived";

    try {
      await Vessel.deleteOne({ _id: vessel._id });
      console.log(`${vesselTag} 🗑️ Deleted from database (Arrived)`);
    } catch (err) {
      console.error(`${vesselTag} ❌ Failed to delete: ${err.message}`);
    }

    return true;
  }

  return false;
}

module.exports = { handleArrival };
