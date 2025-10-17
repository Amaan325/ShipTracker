const express = require("express");
const router = express.Router();
const {
  getEngineers,
  addEngineer,
  updateEngineer,
  deleteEngineer
} = require("../controllers/engineersController");

// GET all engineers
router.get("/", getEngineers);

// POST new engineer
router.post("/", addEngineer);

router.put("/update/:id", updateEngineer);
router.delete("/delete/:id", deleteEngineer);

module.exports = router;
