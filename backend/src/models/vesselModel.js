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
    lastUpdated: { type: Date }, // Added for tracking last position update

    // Allow full object storage
    port: { type: mongoose.Schema.Types.Mixed },
    engineer: { type: mongoose.Schema.Types.Mixed },
    
    // Notification status fields (all thresholds from your config)
    notified_48h: { type: Boolean, default: false },
    notified_24h: { type: Boolean, default: false },
    notified_12h: { type: Boolean, default: false },
    notified_6h: { type: Boolean, default: false },
    notified_zone_entry: { type: Boolean, default: false },

    notified_3h: { type: Boolean, default: false },
    notified_1h: { type: Boolean, default: false },
    notified_30m: { type: Boolean, default: false },
    notified_arrival: { type: Boolean, default: false },
    
    status: {
      type: String,
      enum: ["tracking", "arrived"],
      default: "tracking",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for better query performance
vesselSchema.index({ mmsi: 1 });
vesselSchema.index({ status: 1 });
vesselSchema.index({ isActive: 1 });
vesselSchema.index({ lastUpdated: 1 });

module.exports = mongoose.model("Vessel", vesselSchema);