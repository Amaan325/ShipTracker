// controllers/vesselController.js
const Vessel = require("../models/vesselModel");

const normalizeVesselData = (data) => ({
  mmsi: data.mmsi || data.MMSI,
  imo: data.imo || data.IMO,
  name: data.name || data.NAME,
  callsign: data.callsign || data.CALLSIGN,
  type: data.type || data.TYPE,
  latitude: data.latitude || data.LATITUDE,
  longitude: data.longitude || data.LONGITUDE,
  sog: data.sog ?? data.SOG,
  cog: data.cog ?? data.COG,
  draught: data.draught ?? data.DRAUGHT,
  destination: data.dest || data.DEST || data.destination,
  eta: data.eta || data.ETA,
  port: data.port
    ? {
        _id: data.port._id,
        arrival_port_name: data.port.arrival_port_name,
        unlocode: data.port.unlocode,
        latitude: data.port.latitude ?? data.port.lat,
        longitude: data.port.longitude ?? data.port.lng,
        radiusNm: data.port.radiusNm, // ✅ preserve radius
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

// Save or update
const saveOrCheckVessel = async (req, res) => {
  try {
    const vesselData = normalizeVesselData(req.body);
    if (!vesselData.mmsi)
      return res
        .status(400)
        .json({ success: false, message: "MMSI is required" });

    const existingVessel = await Vessel.findOne({
      mmsi: vesselData.mmsi,
    }).lean();

    if (existingVessel) {
      const sameDetails =
        JSON.stringify(existingVessel.port) ===
          JSON.stringify(vesselData.port) &&
        JSON.stringify(existingVessel.engineer) ===
          JSON.stringify(vesselData.engineer);

      if (sameDetails)
        return res.json({
          success: true,
          message: "Vessel already exists with the same details.",
          vessel: existingVessel,
        });

      if (existingVessel.isActive)
        return res.json({
          success: false,
          conflict: true,
          message:
            "Vessel exists but has different engineer/port. Please deactivate first.",
          vessel: existingVessel,
        });

      const updatedVessel = await Vessel.findOneAndUpdate(
        { mmsi: vesselData.mmsi },
        { $set: vesselData },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Vessel updated successfully.",
        vessel: updatedVessel,
      });
    }

    const newVessel = await Vessel.findOneAndUpdate(
      { mmsi: vesselData.mmsi },
      { $setOnInsert: vesselData },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Vessel saved successfully.",
      vessel: newVessel,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save vessel",
    });
  }
};

// Deactivate
const deactivateVessel = async (req, res) => {
  try {
    const { mmsi } = req.params;
    const vessel = await Vessel.findOneAndDelete({ mmsi });
    if (!vessel)
      return res
        .status(404)
        .json({ success: false, message: "Vessel not found" });

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

// Get all vessels
// controllers/vesselController.js
const getAllVessels = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const [vessels, total] = await Promise.all([
      Vessel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Vessel.countDocuments(),
    ]);

    return res.json({
      success: true,
      count: vessels.length,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      vessels,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch vessels" });
  }
};

// controllers/vesselController.js
const getAllVesselsForMap = async (req, res) => {
  try {
    const vessels = await Vessel.find(
      {},
      { name: 1, mmsi: 1, latitude: 1, longitude: 1, destination: 1, sog: 1 }
    ).lean();

    return res.json({ success: true, vessels });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch vessels for map" });
  }
};

module.exports = {
  saveOrCheckVessel,
  deactivateVessel,
  getAllVessels,
  getAllVesselsForMap,
};
