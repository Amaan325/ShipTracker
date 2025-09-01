const Port = require("../models/portsModel");

const getPorts = async (req, res) => {
  try {
    const ports = await Port.find().sort({ arrival_port_name: 1 }); // alphabetical
    // console.log("Fetched ports:", ports);
    res.status(200).json(ports);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { getPorts };
