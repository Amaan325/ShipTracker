const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectDB = require("./db/connectdb");

// WhatsApp Service
const { startWhatsApp, sendWhatsAppNotification } = require("./src/services/whatsapp");

// Routes
const portRoutes = require("./src/routes/portRoutes");
const engineerRoutes = require("./src/routes/engineerRoutes");
const shipRoutes = require("./src/routes/shipRoutes");
const vesselFinderRoutes = require("./src/routes/vesselFinderRoutes");
const vesselRoutes = require("./src/routes/vesselRoutes");

// Cron
const { startVesselTracking } = require("./cron/trackVessels");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Connect DB, start WhatsApp, then cron
connectDB().then(async () => {
  console.log("✅ Connected to MongoDB");

  // Start WhatsApp
  await startWhatsApp();

  // 🔹 Test message after WhatsApp connection
  // setTimeout(async () => {
  //   await sendWhatsAppNotification("923455388774", "Hello! This is a test 🚀");
  // }, 5000);

  // Start Vessel Tracking Cron
  startVesselTracking();
});

// Routes
app.use("/api/ports", portRoutes);
app.use("/api/engineers", engineerRoutes);
app.use("/api/ships", shipRoutes);
app.use("/api/vessel-finder", vesselFinderRoutes);
app.use("/api/vessels", vesselRoutes);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    statusCode,
  });
});

// Start server
const PORT = process.env.PORT || 9700;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
