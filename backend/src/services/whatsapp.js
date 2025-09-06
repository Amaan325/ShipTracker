const P = require("pino");
const qrcode = require("qrcode-terminal");

let sock;
let baileys; // cache module

async function startWhatsApp() {
  if (!baileys) {
    baileys = await import("@whiskeysockets/baileys");
  }
  const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;

  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 Scan the QR code below to connect WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("⚠️ Connection closed, restarting WhatsApp…");
        startWhatsApp();
      } else {
        console.log("❌ Logged out from WhatsApp, please scan QR again");
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp connected");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

function getSock() {
  if (!sock) throw new Error("WhatsApp not initialized yet");
  return sock;
}

function isConnected() {
  return sock?.user ? true : false;
}

async function isRegisteredUser(number) {
  try {
    const jid = `${number}@s.whatsapp.net`;
    const result = await sock.onWhatsApp(jid);
    return result?.[0]?.exists || false;
  } catch (err) {
    console.error(`❌ Failed to check if ${number} exists:`, err.message);
    return false;
  }
}

async function sendWhatsAppNotification(to, message) {
  try {
    if (!isConnected()) throw new Error("WhatsApp is not connected yet");

    const exists = await isRegisteredUser(to);
    if (!exists) throw new Error(`Number ${to} is not registered on WhatsApp`);

    const jid = `${to}@s.whatsapp.net`;
    const result = await sock.sendMessage(jid, { text: message });

    console.log(`✅ WhatsApp message sent to ${to}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send WhatsApp message to ${to}:`, err.message);
  }
}

module.exports = {
  startWhatsApp,
  getSock,
  isConnected,
  isRegisteredUser,
  sendWhatsAppNotification
};
