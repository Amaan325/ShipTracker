const mongoose = require("mongoose");

const portSchema = new mongoose.Schema({
  arrival_port_name: {
    type: String,
    required: true,
  }, 
  unlocode: {
    type: String,
    required: true,
    unique: true, // UNLO board should be unique per port
  },

    latitude: Number,
  longitude: Number,
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// Export the model directly
module.exports = mongoose.model("Port", portSchema);
