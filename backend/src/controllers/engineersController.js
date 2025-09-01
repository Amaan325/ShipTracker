const Engineer = require("../models/engineerModel");

// ✅ Get all engineers
const getEngineers = async (req, res) => {
  try {
    const engineers = await Engineer.find().sort({ engineer_name: 1 });
    res.status(200).json(engineers);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Add a new engineer
const addEngineer = async (req, res) => {
  try {
    const { engineer_name, email, phone_number } = req.body;

    if (!engineer_name || !email || !phone_number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Engineer.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Engineer with this email already exists" });
    }

    const newEngineer = new Engineer({ engineer_name, email, phone_number });
    await newEngineer.save();

    res.status(201).json(newEngineer);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { getEngineers, addEngineer };
