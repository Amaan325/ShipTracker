const express = require("express");
const { getWhatsAppStatus } = require("../controllers/whatsappController.js");

const router = express.Router();

// ✅ GET /api/whatsapp/status
router.get("/status", getWhatsAppStatus);

module.exports = router;
