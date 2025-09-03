// notify.js (Baileys version)
const { getSock } = require("./whatsapp")

/**
 * Send a WhatsApp notification using Baileys
 * @param {string} to - Engineer phone (E.164, e.g. 923001234567)
 * @param {string} message - Text message
 */
const sendWhatsAppNotification = async (to, message) => {
  try {
    const sock = getSock()
    const jid = `${to}@s.whatsapp.net`

    await sock.sendMessage(jid, { text: message })
    console.log(`✅ WhatsApp message sent to ${to}`)
  } catch (err) {
    console.error(`❌ Failed to send WhatsApp message to ${to}:`, err.message)
  }
}

module.exports = { sendWhatsAppNotification }
