const axios = require("axios");

const getVesselData = async (req, res) => {
  try {
    const { mmsi } = req.params;
    if (!mmsi) {
      return res.status(400).json({ success: false, error: "MMSI required" });
    }

    console.log(`🔍 Incoming request for MMSI: ${mmsi}`);

    // AIS Hub setup
    const username = process.env.AISHUB_USERNAME;
    const aisApiUrl = process.env.API_URL; // https://data.aishub.net/ws.php
    const aisParams = {
      username,
      format: 1,
      output: "json",
      compress: 0,
      mmsi,
      interval: 43200,
    };
    const aisUrl = `${aisApiUrl}?${new URLSearchParams(aisParams).toString()}`;

    console.log(`📡 AIS Hub URL: ${aisUrl}`);

    // 🔹 Try AIS Hub first
    const aisResponse = await axios.get(aisUrl, { timeout: 10000 });
    console.log("✅ AIS Hub raw response:", aisResponse.data);

    const [info, records] = aisResponse.data;
    console.log("ℹ️ AIS Hub Info:", info);
    console.log("📦 AIS Hub Records:", records);

    if (info.ERROR && info.ERROR_MESSAGE === "Too frequent requests!") {
      console.warn("⚠️ AIS Hub: Too frequent requests");
      return res.status(200).json({
        success: false,
        status: "too_frequent",
        message: "Too many requests to AIS Hub. Please wait before retrying.",
      });
    }

    if (info.ERROR) {
      console.error("❌ AIS Hub Error:", info.ERROR_MESSAGE);
      return res.status(400).json({
        success: false,
        status: "error",
        message: info.ERROR_MESSAGE,
      });
    }

    // ✅ AIS Hub has data
    if (records && records.length > 0) {
      console.log("✅ AIS Hub vessel data found.");
      return res.status(200).json({
        success: true,
        status: "ok",
        vessel: records[0],
        source: "aishub",
      });
    }

    // 🔹 No AIS Hub data → Try VesselFinder VESSELS endpoint
    console.warn(`⚠️ No AIS Hub data for ${mmsi}. Trying VesselFinder...`);
    const vfKey = process.env.VF_KEY;
    const vfUrl = `https://api.vesselfinder.com/vessels?userkey=${vfKey}&mmsi=${mmsi}&format=json`;

    console.log(`📡 VesselFinder URL: ${vfUrl}`);

    const vfResponse = await axios.get(vfUrl, { timeout: 10000 });
    console.log("✅ VesselFinder raw response:", vfResponse.data);

    if (!Array.isArray(vfResponse.data) || !vfResponse.data[0]?.AIS) {
      console.warn("⚠️ No VesselFinder vessel data found.");
      return res.status(200).json({
        success: false,
        status: "no_data",
        message: "No AIS data available from either AIS Hub or VesselFinder.",
      });
    }

    // 🔥 Normalize VesselFinder AIS response
    // 🔥 Normalize VesselFinder AIS response to match AIS Hub keys
    const ais = vfResponse.data[0].AIS;
    const vessel = {
      MMSI: ais.MMSI,
      TIME: ais.TIMESTAMP, // Match AIS Hub's TIME field
      LONGITUDE: ais.LONGITUDE || ais.LON,
      LATITUDE: ais.LATITUDE || ais.LAT,
      COG: ais.COURSE, // AIS Hub uses COG
      SOG: ais.SPEED, // AIS Hub uses SOG
      HEADING: ais.HEADING,
      ROT: ais.ROT || null,
      PAC: ais.PAC || null,
      NAVSTAT: ais.NAVSTAT || null,
      IMO: ais.IMO,
      NAME: ais.NAME,
      CALLSIGN: ais.CALLSIGN,
      TYPE: ais.TYPE || null,
      A: ais.A || null,
      B: ais.B || null,
      C: ais.C || null,
      D: ais.D || null,
      DRAUGHT: ais.DRAUGHT || null,
      DEST: ais.DESTINATION || ais.DEST,
      ETA: ais.ETA,
    };

    console.log("🔄 Transformed VesselFinder data:", vessel);

    return res.status(200).json({
      success: true,
      status: "ok",
      vessel,
      source: "vesselfinder",
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(500).json({
      success: false,
      status: "error",
      message: err.message,
    });
  }
};

module.exports = { getVesselData };
