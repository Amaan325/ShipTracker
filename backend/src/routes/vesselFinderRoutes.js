// routes/vesselRoutes.js
const express = require("express");
const router = express.Router();
const { getVesselData } = require("../controllers/vesselFinderController");

router.get("/vessel/:mmsi", getVesselData);

module.exports = router;
 