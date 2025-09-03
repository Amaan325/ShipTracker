require("dotenv").config();
const { sendWhatsAppNotification } = require("../src/services/notify"); // adjust path if needed

(async () => {
  const testNumber = "+923455388774";
  const testMessage = "🚀 Twilio WhatsApp Test: This is a test message!";

  await sendWhatsAppNotification(testNumber, testMessage);
})();
