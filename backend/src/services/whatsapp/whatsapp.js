const P = require("pino");
const QRCode = require("qrcode");
const qrcodeTerminal = require("qrcode-terminal");
const path = require("path");
const fs = require("fs");

let sock;
let baileys;
let firstRun = true;

async function startWhatsApp() {
  if (!baileys) {
    baileys = await import("@whiskeysockets/baileys");
  }

  const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
  } = baileys;

  const authPath = path.resolve("./auth_info");
  const credsFile = path.join(authPath, "creds.json");

  // 🧩 Delete auth only once when creds missing
  if (firstRun && !fs.existsSync(credsFile)) {
    console.log("🗑️ No valid creds found — deleting old auth_info for fresh QR...");
    fs.rmSync(authPath, { recursive: true, force: true });
  }
  firstRun = false;

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  // ✅ Fetch latest version to ensure proper handshake
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`📦 Using WhatsApp Web version: ${version.join(".")} (latest: ${isLatest})`);

  sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["ShipTracker", "Chrome", "10.0"], // ✅ required for proper QR handshake
    markOnlineOnConnect: false,
  });

  console.log("⏳ Waiting for WhatsApp to connect...");

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 QR code received! Please scan it with WhatsApp.");

      qrcodeTerminal.generate(qr, { small: true });
      const qrFilePath = path.join(process.cwd(), "whatsapp-qr.png");
      await QRCode.toFile(qrFilePath, qr);
      console.log(`✅ QR saved at ${qrFilePath}`);
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connected successfully!");
    } else if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("⚠️ Connection closed:", reason || lastDisconnect?.error?.message);

      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Logged out — deleting auth and regenerating QR...");
        fs.rmSync(authPath, { recursive: true, force: true });
        await delay(3000);
        startWhatsApp();
      } else {
        console.log("🔁 Retrying in 5 seconds...");
        await delay(5000);
        startWhatsApp();
      }
    }
  });

  // 🧠 Listen for unexpected internal errors
  sock.ev.on("error", (err) => {
    console.error("🔥 Baileys internal error:", err);
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
}

// Utility for clean async waits
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
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
  sendWhatsAppNotification,
};
