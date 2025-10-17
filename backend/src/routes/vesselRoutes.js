const express = require("express");
const {
  saveOrCheckVessel,
  deactivateVessel,
  getAllVessels,
  getAllVesselsForMap,
  getAllCompletedVessels,
  deleteVessel
} = require("../controllers/vesselController.js");

const router = express.Router();

// Save or check vessel
router.post("/save-or-check", saveOrCheckVessel);
router.get("/getVessels", getAllVessels);
router.get("/getAllForMap", getAllVesselsForMap);
router.get("/getAllCompletedVessels", getAllCompletedVessels);
router.delete("/delete/:id", deleteVessel);
// Deactivate vessel
router.patch("/deactivate/:mmsi", deactivateVessel);

module.exports = router;
