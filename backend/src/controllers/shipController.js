// controllers/shipController.js
const Ship = require("../models/shipsModel");
const Port = require("../models/portsModel");
const Engineer = require("../models/engineerModel");

// MMSI validation helper
const isValidMmsi = (mmsi) => /^[0-9]{9}$/.test(mmsi);

// GET /api/ships/search?q=M
const searchShips = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Case-insensitive search for ships starting with the query
    const ships = await Ship.find({
      name: { $regex: `^${q}`, $options: "i" },
    }).select("name mmsi"); // only return needed fields

    res.status(200).json(ships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add Vessel
const addVessel = async (req, res) => {
  try {
    const { name, mmsi, port: portId, engineers: engineerIds , label } = req.body;

    if (!name || !mmsi || !label || !portId || !engineerIds || engineerIds.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const vesselName = name.trim();
    const vesselMmsi = mmsi.toString().trim();

    // Validate MMSI
    if (!isValidMmsi(vesselMmsi)) {
      return res.status(400).json({ message: "MMSI must be exactly 9 digits" });
    }

    // Check if vessel exists by MMSI
    let existingVessel = await Ship.findOne({ mmsi: vesselMmsi });

    if (existingVessel) {
      const populatedPort = await Port.findById(portId);
      const populatedEngineers = await Engineer.find({ _id: { $in: engineerIds } });

      existingVessel = existingVessel.toObject();
      existingVessel.port = populatedPort;
      existingVessel.engineers = populatedEngineers;
      existingVessel.isActive = "yes";
  existingVessel.label = label; // ✅ Add this line

      return res.status(200).json({
        message: "Vessel already exists",
        vessel: existingVessel,
      });
    }

    const portDoc = await Port.findById(portId);
    const engineerDocs = await Engineer.find({ _id: { $in: engineerIds } });

    if (!portDoc || engineerDocs.length === 0) {
      return res.status(404).json({ message: "Port or Engineers not found" });
    }

    const newVessel = new Ship({
      name: vesselName,
      mmsi: vesselMmsi,
    });

    await newVessel.save();

    const responseVessel = newVessel.toObject();
    responseVessel.port = portDoc;
    responseVessel.engineers = engineerDocs;
    responseVessel.label = label;
    responseVessel.isActive = "yes";
    
    res.status(201).json({
      message: "Vessel added successfully",
      vessel: responseVessel,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { searchShips, addVessel };
