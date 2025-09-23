const NOTIFICATION_THRESHOLDS = [
  {
    threshold: 12,
    key: "notified_12h",
    message: (v) =>
      `🕛 ${v.name} is ~12 hours away from ${v.port.arrival_port_name}`,
  },
  {
    threshold: 48,
    key: "notified_48h",
    message: (v) =>
      `⏳ ${v.name} is ~48 hours away from ${v.port.arrival_port_name}`,
  },
];

// Zone entry config
const ZONE_RADIUS_NM = 25;
const ZONE_ENTRY_NOTIFICATION = {
  key: "notified_zone_entry",
  radiusNm: ZONE_RADIUS_NM,
  message: (v) => {
    if (v.indicated_zone_entry) return null; // already sent once
    v.indicated_zone_entry = true;
    return `🚢 ${v.name} has entered the port zone (${v.port.arrival_port_name})`;
  },
};

// Arrival config
const ARRIVAL_NOTIFICATION = {
  key: "notified_arrival",
  indicatedKey: "indicated_notified_arrival",
  message: (v) => {
    if (!v.notified_zone_entry) {
      if (v.indicated_notified_arrival) return null;
      v.indicated_notified_arrival = true;
      return `✅ ${v.name} AIS indicates arrival at ${v.port.arrival_port_name} but vessel has NOT entered port zone yet. Plan with caution.`;
    }
    if (v.indicated_notified_arrival) return null;
    v.indicated_notified_arrival = true;
    return `✅ ${v.name} has arrived at ${v.port.arrival_port_name}`;
  },
};

const ARRIVAL_THRESHOLD_HOURS = 0.1; // 6 minutes
const ARRIVAL_SPEED_THRESHOLD = 0.5;
const MIN_SPEED_FOR_ETA_CALC = 0.1;

module.exports = {
  NOTIFICATION_THRESHOLDS,
  ZONE_ENTRY_NOTIFICATION,
  ARRIVAL_NOTIFICATION,
  ARRIVAL_THRESHOLD_HOURS,
  ARRIVAL_SPEED_THRESHOLD,
  MIN_SPEED_FOR_ETA_CALC,
};
