// src/components/ShipDetails/fields.js
export const navStatusMap = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted manoeuvrability",
  4: "Constrained by draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in fishing",
  8: "Under way sailing",
  15: "Not defined",
};

export const fieldMap = {
  NAME: "Ship Name",
  MMSI: "MMSI Number",
  IMO: "IMO Number",
  CALLSIGN: "Callsign",
  NAVSTAT: "Navigation Status",
  SOG: "Speed (knots)",
  COG: "Course (°)",
  HEADING: "Heading (°)",
  LATITUDE: "Latitude",
  LONGITUDE: "Longitude",
  DRAUGHT: "Draught (m)",
  DEST: "Destination",
  ETA: "Estimated Time of Arrival",
  TIME: "Last Updated",
    port: "Port",        // ✅ Add this
  engineer: "Engineer", // ✅ Add this
  // isActive : "Active"
};
