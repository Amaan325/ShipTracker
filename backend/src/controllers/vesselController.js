const Vessel = require("../models/vesselModel");

/**
 * Normalize incoming vessel data
 * Store full engineer and port objects (not just IDs)
 */
const normalizeVesselData = (data) => ({
  mmsi: data.mmsi || data.MMSI,
  imo: data.imo || data.IMO,
  name: data.name || data.NAME,
  callsign: data.callsign || data.CALLSIGN,
  type: data.type || data.TYPE,
  latitude: data.latitude || data.LATITUDE,
  longitude: data.longitude || data.LONGITUDE,
  sog: data.sog || data.SOG,
  cog: data.cog || data.COG,
  draught: data.draught || data.DRAUGHT,
  destination: data.dest || data.DEST || data.destination,
  eta: data.eta || data.ETA,
  port: data.port
    ? {
        _id: data.port._id,
        arrival_port_name: data.port.arrival_port_name,
        unlocode: data.port.unlocode,
        latitude: data.port.latitude ?? data.port.lat,
        longitude: data.port.longitude ?? data.port.lng,
      }
    : null,
  engineer: data.engineer
    ? {
        _id: data.engineer._id,
        engineer_name: data.engineer.engineer_name,
        email: data.engineer.email,
        phone_number: data.engineer.phone_number,
      }
    : null,
  isActive: data.isActive ?? true,
});

/**
 * Save or update vessel with conflict logic
 */
const saveOrCheckVessel = async (req, res) => {
  try {
    // console.log("📥 Incoming Vessel Data (Raw):", req.body);
    const vesselData = normalizeVesselData(req.body);

    if (!vesselData.mmsi) {
      console.log("❌ Missing MMSI. Cannot save vessel.");
      return res.status(400).json({ success: false, message: "MMSI is required" });
    }

    const existingVessel = await Vessel.findOne({ mmsi: vesselData.mmsi });
    // console.log("🔍 Existing Vessel Found:", existingVessel);

    if (existingVessel) {
      const sameDetails =
        JSON.stringify(existingVessel.port) === JSON.stringify(vesselData.port) &&
        JSON.stringify(existingVessel.engineer) === JSON.stringify(vesselData.engineer);

      if (sameDetails) {
        console.log("ℹ️ Vessel already exists with the SAME engineer & port.");
        return res.json({
          success: true,
          message: "Vessel already exists with the same details.",
          vessel: existingVessel,
        });
      }

      if (existingVessel.isActive) {
        console.log("⚠️ Vessel exists but is ACTIVE with different engineer/port.");
        return res.json({
          success: false,
          conflict: true,
          message: "Vessel exists but has different engineer/port. Please deactivate first.",
          vessel: existingVessel,
        });
      }

      console.log("🔄 Vessel is INACTIVE. Updating...");
      const updatedVessel = await Vessel.findOneAndUpdate(
        { mmsi: vesselData.mmsi },
        { $set: vesselData },
        { new: true }
      );
      console.log("✅ Vessel Updated:", updatedVessel);

      return res.json({
        success: true,
        message: "Vessel updated successfully.",
        vessel: updatedVessel,
      });
    }

    console.log("🆕 No existing vessel. Creating new one...");
    const upsertedVessel = await Vessel.findOneAndUpdate(
      { mmsi: vesselData.mmsi },
      { $setOnInsert: vesselData },
      { new: true, upsert: true }
    );
    console.log("✅ Vessel Created:", upsertedVessel);

    return res.json({
      success: true,
      message: "Vessel saved successfully.",
      vessel: upsertedVessel,
    });
  } catch (err) {
    console.error("💥 Error saving vessel:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to save vessel" });
  }
};

/**
 * Deactivate (delete) a vessel by MMSI
 */
const deactivateVessel = async (req, res) => {
  try {
    const { mmsi } = req.params;
    console.log(`🗑️ Deleting vessel with MMSI: ${mmsi}`);

    const vessel = await Vessel.findOneAndDelete({ mmsi });
    if (!vessel) {
      console.log("❌ Vessel not found.");
      return res.status(404).json({ success: false, message: "Vessel not found" });
    }

    return res.json({
      success: true,
      message: "Vessel deleted successfully",
      vessel,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error deleting vessel" });
  }
};

/**
 * Get all vessels (sorted by most recently added)
 */
const getAllVessels = async (req, res) => {
  try {
    console.log("📡 Fetching all vessels (sorted by recently added)...");
    const vessels = await Vessel.find().sort({ createdAt: -1 });
    console.log(`✅ Fetched ${vessels.length} vessels.`);

    return res.json({
      success: true,
      count: vessels.length,
      vessels,
    });
  } catch (err) {
    console.error("💥 Error fetching vessels:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch vessels" });
  }
};

module.exports = { saveOrCheckVessel, deactivateVessel, getAllVessels };
