// src/services/utils/vesselUtils.js

/**
 * Merge AIS/VF data into vessel document.
 * Handles both AISHUB (uppercase keys) and VF (some different keys).
 * Ensures lat/lon are numbers rounded to 5 decimals.
 */
function mergeAISFields(vessel, aisData) {
  const map = {
    MMSI: "mmsi",
    IMO: "imo",
    NAME: "name",
    CALLSIGN: "callsign",
    NAVSTAT: "navigationStatus",
    SOG: "sog",
    LATITUDE: "latitude",
    LONGITUDE: "longitude",
    DEST: "destination", // AISHub
    DESTINATION: "destination", // VF
    ETA: "eta",
    ETA_AIS: "eta", // sometimes VF provides ETA_AIS
    TIME: "lastUpdated",
    TIMESTAMP: "lastUpdated",
    TYPE: "type",
    HEADING: "heading",
    COG: "cog",
    ROT: "rateOfTurn",
    A: "dimA",
    B: "dimB",
    C: "dimC",
    D: "dimD",
    DRAUGHT: "draught",
    LOCODE: "locode",
  };

  for (const [src, dest] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(aisData, src)) {
      vessel[dest] = aisData[src];
    }
  }

  // Ensure numeric conversions & rounding for coordinates & speeds
  if (vessel.latitude != null) vessel.latitude = Number(Number(vessel.latitude).toFixed(5));
  if (vessel.longitude != null) vessel.longitude = Number(Number(vessel.longitude).toFixed(5));
  if (vessel.sog != null) vessel.sog = Number(vessel.sog);
  if (vessel.cog != null) vessel.cog = Number(vessel.cog);

  // Set lastUpdated if available from provider, else now
  vessel.lastUpdated = new Date();

  // If incoming record indicates it was from VF, preserve/update lastVFUpdate
  if (aisData.__source === "VF") {
    vessel.lastVFUpdate = new Date();
  }

  return vessel;
}

module.exports = { mergeAISFields };
