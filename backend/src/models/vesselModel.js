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
    lastUpdated: { type: Date },

    // NEW: Track when VF was last queried
    lastVFUpdate: { type: Date, default: null },

    port: { type: mongoose.Schema.Types.Mixed },
    // models/vesselModel.js
    engineers: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    notified_48h: { type: Boolean, default: false },
    // notified_24h: { type: Boolean, default: false },
    notified_12h: { type: Boolean, default: false },
    // notified_6h: { type: Boolean, default: false },
    notified_zone_entry: { type: Boolean, default: false },
    // notified_3h: { type: Boolean, default: false },
    // notified_1h: { type: Boolean, default: false },
    // notified_30m: { type: Boolean, default: false },
    notified_arrival: { type: Boolean, default: false },

    // NEW: "indicated" flags → message only once unless reset
    // indicated_notified_3h: { type: Boolean, default: false },
    // indicated_notified_1h: { type: Boolean, default: false },
    // indicated_notified_30m: { type: Boolean, default: false },
    // indicated_notified_arrival: { type: Boolean, default: false },
    trackingStartedAt: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["tracking", "arrived"],
      default: "tracking",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for query performance
vesselSchema.index({ mmsi: 1 });
vesselSchema.index({ status: 1 });
vesselSchema.index({ isActive: 1 });
vesselSchema.index({ lastUpdated: 1 });

module.exports = mongoose.model("Vessel", vesselSchema);
