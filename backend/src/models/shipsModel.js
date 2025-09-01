const mongoose = require("mongoose");

const shipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mmsi: {
    type: String,
    required: true,
    unique: true, // MMSI should be unique for each ship
  },
  imo: {
    type: Number,
    // required: true,
    unique: true, // IMO number is also unique
  },
}, {
  timestamps: true, // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("Ship", shipSchema);

