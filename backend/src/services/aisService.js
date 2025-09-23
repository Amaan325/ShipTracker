// services/fetchAISBatch.js
const axios = require("axios");

const AISHUB_URL = "https://data.aishub.net/ws.php";
const VF_URL = "https://api.vesselfinder.com/vessels";
const AISHUB_KEY = process.env.AISHUB_USERNAME;
const VF_KEY = process.env.VF_KEY;

const AIS_RETRY_DELAY_MS = 30000; // 30s delay between attempts

/**
 * Decide if VF fetch is allowed for a vessel
 */
function shouldFetchFromVF(vessel) {
  const lastUpdate = vessel.lastVFUpdate
    ? new Date(vessel.lastVFUpdate)
    : vessel.lastUpdated
    ? new Date(vessel.lastUpdated)
    : null;

  const hoursSince = lastUpdate
    ? (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    : Infinity;

  const destMatch =
    (vessel.destination || "").trim().toLowerCase() ===
    (vessel.selectionPort || "").trim().toLowerCase();

  return destMatch ? hoursSince > 6 : hoursSince > 24;
}

/**
 * Call AISHub batch
 */
async function callAISHubBatch(vessels) {
  const mmsiList = vessels.map((v) => v.mmsi).join(",");
  const params = new URLSearchParams({
    username: AISHUB_KEY,
    output: "json",
    compress: "0",
    mmsi: mmsiList,
    format: "1", // Important: decimal coordinates
  });
  const url = `${AISHUB_URL}?${params}`;
  const resp = await axios.get(url);
  return resp.data;
}

/**
 * Call VesselFinder for a single vessel
 */
async function callVesselFinder(vessel) {
  try {
    console.log(`\n[VF] 🔹 Fetching data for ${vessel.name || vessel.mmsi}...`);
    const vfParams = new URLSearchParams({
      userkey: VF_KEY,
      mmsi: vessel.mmsi,
      format: "json",
    });
    const { data: vfResponse } = await axios.get(`${VF_URL}?${vfParams}`);
    const vfData = vfResponse?.[0]?.AIS || vfResponse?.AIS || null;

    if (!vfData) {
      console.warn(`[VF] ⚠️ No data found for ${vessel.name || vessel.mmsi}`);
      return null;
    }

    vfData.__source = "VF";
    console.log(
      `[VF] ✅ ${vessel.name || vessel.mmsi} | Lat: ${vfData.LATITUDE}, Lon: ${vfData.LONGITUDE}`
    );
    return vfData;
  } catch (err) {
    console.error(`[VF] ❌ Request failed for ${vessel.name || vessel.mmsi}: ${err.message}`);
    return null;
  }
}

/**
 * Main function
 */
async function fetchAISDataForBatch(vessels) {
  console.log(`\n♻️ [Batch] Starting processing of ${vessels.length} vessels...`);
  const aisDataMap = new Map();
  const failedVessels = [];
  let attempt = 1;
  let data = null;

  // === AIS attempts loop ===
  while (attempt <= 5) {
    try {
      console.log(`\n[AIS Hub] 🔹 Attempt ${attempt} for ${vessels.length} vessels...`);
      data = await callAISHubBatch(vessels);

      if (!data) throw new Error("Empty response from AIS Hub");

      if (Array.isArray(data) && data[0]?.ERROR_MESSAGE === "Too frequent requests!") {
        console.warn(`[AIS Hub] ⏳ Too frequent requests!`);
        if (attempt < 5) {
          console.log(`[AIS Hub] Waiting ${AIS_RETRY_DELAY_MS / 1000}s before retry...`);
          await new Promise((r) => setTimeout(r, AIS_RETRY_DELAY_MS));
        }
        attempt++;
        continue;
      }

      console.log("[AIS Hub] ✅ Batch response received successfully");
      break; // Success
    } catch (err) {
      console.error(`[AIS Hub] ❌ Attempt ${attempt} failed: ${err.message}`);
      if (attempt < 5) {
        console.log(`[AIS Hub] Waiting ${AIS_RETRY_DELAY_MS / 1000}s before next attempt...`);
        await new Promise((r) => setTimeout(r, AIS_RETRY_DELAY_MS));
      }
      attempt++;
    }
  }

  if (!data || (Array.isArray(data) && data[0]?.ERROR_MESSAGE === "Too frequent requests!")) {
    console.error("[AIS Hub] ❌ Max attempts reached due to rate limit. Skipping VF fallback.");
    return { aisDataMap, failedVessels: vessels };
  }

  // === Parse AIS ships ===
  let ships = [];
  if (Array.isArray(data) && data.length === 2 && Array.isArray(data[1])) {
    ships = data[1];
  } else if (data?.ais?.ships) {
    ships = data.ais.ships;
  } else if (Array.isArray(data)) {
    ships = data;
  }

  // === Check each vessel ===
  for (const vessel of vessels) {
    const aisRecord = ships.find((r) => String(r.MMSI) === String(vessel.mmsi));
    if (aisRecord) {
      aisRecord.__source = "AISHUB";
      aisDataMap.set(vessel.mmsi, aisRecord);
      console.log(
        `[AIS Hub] ✅ Vessel: ${vessel.name || vessel.mmsi} | Lat: ${aisRecord.LATITUDE}, Lon: ${aisRecord.LONGITUDE}`
      );
    } else {
      console.warn(`[AIS Hub] ⚠️ No AIS data for vessel: ${vessel.name || vessel.mmsi}`);
      failedVessels.push(vessel);
    }
  }

  // === VF fallback ===
  if (failedVessels.length > 0) {
    console.log(`\n[VF] 🔹 Attempting VesselFinder for ${failedVessels.length} vessels...`);
  } else {
    console.log(`\n[VF] ✅ No VF fallback needed, all vessels have AIS data.`);
  }

  for (const vessel of failedVessels.slice()) {
    if (!shouldFetchFromVF(vessel)) {
      console.log(`[VF] ⏭️ Skipping ${vessel.name || vessel.mmsi} (timing rules not met)`);
      continue;
    }

    const vf = await callVesselFinder(vessel);
    if (vf) {
      aisDataMap.set(vessel.mmsi, vf);
      try {
        vessel.lastVFUpdate = new Date();
        await vessel.save();
        console.log(`[VF] 💾 Saved lastVFUpdate for vessel: ${vessel.name || vessel.mmsi}`);
      } catch (err) {
        console.warn(`[VF] ⚠️ Failed to save lastVFUpdate for vessel ${vessel.name || vessel.mmsi}: ${err.message}`);
      }
    } else {
      console.warn(`[VF] ⚠️ VF returned no data for vessel: ${vessel.name || vessel.mmsi}`);
    }
  }

  console.log(`\n✅ [Batch] Finished processing ${vessels.length} vessels`);
  console.log("==============================================\n");

  return { aisDataMap, failedVessels };
}

module.exports = { fetchAISDataForBatch };
