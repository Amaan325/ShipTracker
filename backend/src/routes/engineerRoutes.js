const express = require("express");
const router = express.Router();
const { getEngineers, addEngineer } = require("../controllers/engineersController");

// GET all engineers
router.get("/", getEngineers);

// POST new engineer
router.post("/", addEngineer);

module.exports = router;
