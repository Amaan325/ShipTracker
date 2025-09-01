// db.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongodb_url); // no options needed
console.log("Connected DB:", mongoose.connection.name);

  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected!");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});

module.exports = connectDB;
