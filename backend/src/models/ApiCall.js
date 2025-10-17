// models/ApiCall.js
const mongoose = require("mongoose");

const apiCallSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["AISHUB", "VF"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // for faster date filtering
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApiCall", apiCallSchema);
