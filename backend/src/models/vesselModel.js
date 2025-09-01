const mongoose = require("mongoose");

const vesselSchema = new mongoose.Schema(
  {
    mmsi: { type: String, required: true, unique: true },
    imo: { type: String },
    name: { type: String },
    callsign: { type: String },
    type: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    sog: { type: Number },
    cog: { type: Number },
    draught: { type: Number },
    destination: { type: String },
    eta: { type: String },

    // Allow full object storage
    port: { type: mongoose.Schema.Types.Mixed },
    engineer: { type: mongoose.Schema.Types.Mixed },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vessel", vesselSchema);
