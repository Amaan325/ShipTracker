const mongoose = require("mongoose");

const portSchema = new mongoose.Schema(
  {
    arrival_port_name: {
      type: String,
      required: true,
    },
    unlocode: {
      type: String,
      required: true,
      unique: true,
    },
    latitude: Number,
    longitude: Number,

    // ✅ radius in nautical miles
    radiusNm: {
      type: Number,
      default: 25, // ~45 km default
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Port", portSchema);
