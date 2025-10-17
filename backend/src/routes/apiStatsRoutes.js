// routes/apiStatsRoutes.js
const express = require("express");
const router = express.Router();
const { getApiStats } = require("../controllers/apiStatsController");

router.get("/stats", getApiStats);

module.exports = router;
