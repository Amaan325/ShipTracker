const express = require("express");
const {
  saveOrCheckVessel,
  deactivateVessel,
  getAllVessels,
  getAllVesselsForMap
} = require("../controllers/vesselController.js");

const router = express.Router();

// Save or check vessel
router.post("/save-or-check", saveOrCheckVessel);
router.get("/getVessels", getAllVessels);
router.get("/getAllForMap", getAllVesselsForMap);

// Deactivate vessel
router.patch("/deactivate/:mmsi", deactivateVessel);

module.exports = router;
