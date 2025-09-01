const mongoose = require("mongoose");

const engineerSchema = new mongoose.Schema({
  engineer_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // prevent duplicate emails
  },
  phone_number: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});


module.exports = mongoose.model("Engineer", engineerSchema);