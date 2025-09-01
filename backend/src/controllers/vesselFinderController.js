const axios = require("axios");

const getVesselData = async (req, res) => {
    // console.log("Received request for vessel data with params:", req.params);
  try {
    const { mmsi } = req.params;
    if (!mmsi) return res.status(400).json({ success: false, error: "MMSI required" });

    const username = process.env.AISHUB_USERNAME;
    const apiUrl = process.env.API_URL; // https://data.aishub.net/ws.php

    const params = {
      username,
      format: 1,
      output: "json",
      compress: 0,
      mmsi,
      interval: 43200,
    };

    const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;

    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    const [info, records] = data;

    // Too frequent requests
    if (info.ERROR && info.ERROR_MESSAGE === "Too frequent requests!") {
      return res.status(200).json({
        success: false,
        status: "too_frequent",
        message: "Too many requests to AIS Hub. Please wait before retrying.",
      });
    }

    // Other AIS Hub errors
    if (info.ERROR) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: info.ERROR_MESSAGE,
      });
    }

    // No vessel data
    if (!records || records.length === 0) {
      return res.status(200).json({
        success: false,
        status: "no_data",
        message: "No AIS data available for this vessel.",
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      status: "ok",
      vessel: records[0],
    });

  } catch (err) {
    console.error("AIS Hub error:", err.message);
    return res.status(500).json({ success: false, status: "error", message: err.message });
  }
};

module.exports = { getVesselData };
 