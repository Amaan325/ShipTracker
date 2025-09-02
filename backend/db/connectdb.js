const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.mongodb_url;
if (!MONGO_URI) {
  console.error("🚨 MONGO_URI is not set in .env");
  process.exit(1);
}

let isConnectedBefore = false;
let connectAttempts = 0;

const connectDB = async () => {
  try {
    connectAttempts++;
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // fail if no server in 5s
      socketTimeoutMS: 45000,         // close idle sockets after 45s
    });

    isConnectedBefore = true;
    console.log("✅ MongoDB connected:", mongoose.connection.name);
  } catch (err) {
    const delay = Math.min(3000 * connectAttempts, 30000); // exponential backoff capped at 30s
    console.error(
      `🚨 MongoDB connection failed (attempt ${connectAttempts}): ${err.message}`
    );
    console.log(`⏳ Retrying in ${delay / 1000}s...`);
    setTimeout(connectDB, delay);
  }
};

// Handle disconnects
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected!");
  if (!isConnectedBefore) return; // only retry if it was connected before
  connectDB();
});

// Log errors
mongoose.connection.on("error", (err) => {
  console.error("🚨 MongoDB error:", err);
});

// Optional: log successful reconnections
mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected successfully!");
});

module.exports = connectDB;
