const axios = require("axios");

const API_URL = process.env.API_URL;
const AISHUB_USERNAME = process.env.AISHUB_USERNAME;

if (!API_URL || !AISHUB_USERNAME) {
  console.error("❌ Missing API_URL or AISHUB_USERNAME in .env");
}

/**
 * Fetch AIS data for a batch of MMSIs
 * @param {Array<number>} mmsiBatch
 * @returns {Promise<Array>} AIS records
 */
const fetchAISDataForBatch = async (mmsiBatch) => {
  if (!mmsiBatch.length) return [];

  try {
    const params = {
      username: AISHUB_USERNAME,
      format: 1,
      output: "json",
      compress: 0,
      mmsi: mmsiBatch.join(","),
      interval: 43200,
    };

    const url = `${API_URL}?${new URLSearchParams(params)}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    const [info, records] = data;
    if (info?.ERROR) {
      console.error("🌐 AIS API error:", info.ERROR_MESSAGE);
      return [];
    }

    console.log(`✅ Fetched AIS data for batch: ${mmsiBatch.join(", ")}`);
    return records || [];
  } catch (err) {
    console.error("🌐 AIS API request failed:", err.message);
    return [];
  }
};

module.exports = { fetchAISDataForBatch };
