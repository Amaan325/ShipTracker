// routes/shipRoutes.js
const express = require("express");
const router = express.Router();
const { searchShips , addVessel} = require("../controllers/shipController");

router.get("/search", searchShips);
router.post("/", addVessel);

module.exports = router;
