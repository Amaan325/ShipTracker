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
        radiusNm: data.port.radiusNm,
      }
    : null,

  engineers: Array.isArray(data.engineers)
    ? data.engineers.map((eng) => ({
        _id: eng._id,
        engineer_name: eng.engineer_name,
        email: eng.email,
        phone_number: eng.phone_number,
      }))
    : [],

  status: data.status || "tracking", // 👈 default to tracking
});

// ✅ Save or update vessel
const saveOrCheckVessel = async (req, res) => {
  try {
    const vesselData = normalizeVesselData(req.body);
    if (!vesselData.mmsi) {
      return res
        .status(400)
        .json({ success: false, message: "MMSI is required" });
    }

    const existingVessel = await Vessel.findOne({
      mmsi: vesselData.mmsi,
    }).lean();

    if (existingVessel) {
      const samePort =
        JSON.stringify(existingVessel.port) === JSON.stringify(vesselData.port);

      // 🚀 Reactivate vessel if already completed
      if (existingVessel.status === "arrived") {
        const reactivated = await Vessel.findOneAndUpdate(
          { mmsi: vesselData.mmsi },
          {
            $set: {
              ...vesselData,
              status: "tracking",
              notified_48h: false,
              notified_12h: false,
              notified_zone_entry: false,
              notified_arrival: false,
              isActive: true,
              trackingStartedAt: new Date(), // 👈 reset tracking start
            },
          },
          { new: true }
        );

        return res.json({
          success: true,
          message: "Vessel re-activated for tracking and notifications reset.",
          vessel: reactivated,
        });
      }

      // 🚀 Merge engineers if same port & still tracking
      if (existingVessel.status === "tracking" && samePort) {
        const mergedEngineers = [
          ...existingVessel.engineers,
          ...vesselData.engineers,
        ].filter(
          (eng, index, self) =>
            index ===
            self.findIndex((e) => e._id.toString() === eng._id.toString())
        );

        const updatedVessel = await Vessel.findOneAndUpdate(
          { mmsi: vesselData.mmsi },
          { $set: { engineers: mergedEngineers } },
          { new: true }
        );

        return res.json({
          success: true,
          message: "Engineer(s) added to vessel successfully.",
          vessel: updatedVessel,
        });
      }

      // ❌ Conflict if different port
      if (!samePort && existingVessel.status === "tracking") {
        return res.json({
          success: false,
          conflict: true,
          message:
            "Vessel exists but has different port. Please deactivate first.",
          vessel: existingVessel,
        });
      }

      // Default update case
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

    // 🚀 New vessel
    const newVessel = await Vessel.findOneAndUpdate(
      { mmsi: vesselData.mmsi },
      {
        $setOnInsert: {
          ...vesselData,
          notified_48h: false,
          notified_12h: false,
          notified_zone_entry: false,
          notified_arrival: false,
          trackingStartedAt: new Date(), // 👈 initial tracking start
        },
      },
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

// ✅ Deactivate vessel
const deactivateVessel = async (req, res) => {
  try {
    const { mmsi } = req.params;
    const vessel = await Vessel.findOneAndUpdate(
      { mmsi },
      { $set: { status: "inactive" } },
      { new: true }
    );
    if (!vessel) {
      return res
        .status(404)
        .json({ success: false, message: "Vessel not found" });
    }

    return res.json({
      success: true,
      message: "Vessel deactivated successfully",
      vessel,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error deactivating vessel" });
  }
};

// ✅ Get active tracking vessels
const getAllVessels = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const query = { status: "tracking" };

    const [vessels, total] = await Promise.all([
      Vessel.find(query)
        .sort({ trackingStartedAt: -1 }) // 👈 use trackingStartedAt instead of createdAt
        .skip(skip)
        .limit(limit)
        .lean(),
      Vessel.countDocuments(query),
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
      .json({ success: false, message: "Failed to fetch tracking vessels" });
  }
};

// ✅ Get all vessels for map
const getAllVesselsForMap = async (req, res) => {
  try {
    const vessels = await Vessel.find(
      {},
      {
        name: 1,
        mmsi: 1,
        latitude: 1,
        longitude: 1,
        destination: 1,
        sog: 1,
        status: 1,
      }
    ).lean();

    return res.json({ success: true, vessels });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch vessels for map" });
  }
};

// ✅ Get completed vessels
const getAllCompletedVessels = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const query = { status: "arrived" };

    const [vessels, total] = await Promise.all([
      Vessel.find(query)
        .sort({ trackingStartedAt: -1 }) // 👈 sort by last tracking session
        .skip(skip)
        .limit(limit)
        .lean(),
      Vessel.countDocuments(query),
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
      .json({ success: false, message: "Failed to fetch completed vessels" });
  }
};

module.exports = {
  saveOrCheckVessel,
  deactivateVessel,
  getAllVessels,
  getAllCompletedVessels,
  getAllVesselsForMap,
};
