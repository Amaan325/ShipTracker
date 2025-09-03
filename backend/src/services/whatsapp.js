// backend/src/services/whatsapp.js
const P = require("pino")
const qrcode = require("qrcode-terminal")

let sock

async function startWhatsApp() {
  const baileys = await import("@whiskeysockets/baileys")
  const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys

  const { state, saveCreds } = await useMultiFileAuthState("./auth_info")

  sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" })
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("📲 Scan the QR code below to connect WhatsApp:")
      qrcode.generate(qr, { small: true }) // ✅ shows a proper QR in terminal
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log("⚠️ Connection closed, restarting WhatsApp…")
        startWhatsApp()
      } else {
        console.log("❌ Logged out from WhatsApp, please scan QR again")
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp connected")
    }
  })

  sock.ev.on("creds.update", saveCreds)

  return sock
}

function getSock() {
  if (!sock) throw new Error("WhatsApp not initialized yet")
  return sock
}

async function sendWhatsAppNotification(to, message) {
  try {
    const sock = getSock()
    const jid = `${to}@s.whatsapp.net`
    await sock.sendMessage(jid, { text: message })
    console.log(`✅ WhatsApp message sent to ${to}`)
  } catch (err) {
    console.error(`❌ Failed to send WhatsApp message to ${to}:`, err.message)
  }
}

module.exports = { startWhatsApp, getSock, sendWhatsAppNotification }
