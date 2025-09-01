const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectdb = require("./db/connectdb");

// Import routes
const portRoutes = require("./src/routes/portRoutes");
const engineerRoutes = require("./src/routes/engineerRoutes");
const shipRoutes = require("./src/routes/shipRoutes");
const vesselFinderRoutes = require("./src/routes/vesselFinderRoutes");
const vesselRoutes = require("./src/routes/vesselRoutes");
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Connect to MongoDB
connectdb();

// Routes
app.use("/api/ports", portRoutes);
app.use("/api/engineers", engineerRoutes);
app.use("/api/ships", shipRoutes);
app.use("/api/vessel-finder", vesselFinderRoutes);
app.use("/api/vessels", vesselRoutes);
// Error handling middleware (after routes)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    error: errorMessage,
    statusCode,
  });
});

// Start server
const PORT = process.env.PORT || 9700;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
