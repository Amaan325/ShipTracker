const express = require("express");
const {
  saveOrCheckVessel,
  deactivateVessel,
  getAllVessels,
} = require("../controllers/vesselController.js");

const router = express.Router();

// Save or check vessel
router.post("/save-or-check", saveOrCheckVessel);
router.get("/getVessels", getAllVessels);

// Deactivate vessel
router.patch("/deactivate/:mmsi", deactivateVessel);

module.exports = router;
