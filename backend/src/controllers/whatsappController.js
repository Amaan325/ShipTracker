// controllers/whatsappController.js
const { isConnected } = require("../services/whatsapp/whatsapp.js");

exports.getWhatsAppStatus = (req, res) => {
  try {
    const connected = isConnected();

    res.status(200).json({
      connected,
      message: connected
        ? "✅ WhatsApp is connected"
        : "❌ WhatsApp is disconnected",
    });
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    res.status(500).json({
      connected: false,
      message: "Error fetching WhatsApp connection status",
    });
  }
};
