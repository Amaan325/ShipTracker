const express = require("express");
const router = express.Router();
const { getPorts } = require("../controllers/portsController");

router.get("/", getPorts);

module.exports = router;
