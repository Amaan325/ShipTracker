const NOTIFICATION_THRESHOLDS = [
  { threshold: 0.5, key: 'notified_30m', message: (v) => `⏱️ ${v.name} is ~30 minutes away from ${v.port.arrival_port_name}` },
  { threshold: 1,   key: 'notified_1h',  message: (v) => `🕐 ${v.name} is ~1 hour away from ${v.port.arrival_port_name}` },
  { threshold: 3,   key: 'notified_3h',  message: (v) => `🕒 ${v.name} is ~3 hours away from ${v.port.arrival_port_name}` },
  { threshold: 6,   key: 'notified_6h',  message: (v) => `🕕 ${v.name} is ~6 hours away from ${v.port.arrival_port_name}` },
  { threshold: 12,  key: 'notified_12h', message: (v) => `🕛 ${v.name} is ~12 hours away from ${v.port.arrival_port_name}` },
  { threshold: 24,  key: 'notified_24h', message: (v) => `⚓ ${v.name} is ~24 hours away from ${v.port.arrival_port_name}` },
  { threshold: 48,  key: 'notified_48h', message: (v) => `⏳ ${v.name} is ~48 hours away from ${v.port.arrival_port_name}` },
];

// 🛳️ Distance-based threshold (30 km ≈ 16.2 nautical miles)
// 🛳️ Distance-based threshold (37 km ≈ 20 nautical miles)

const ZONE_RADIUS_NM = 25;
const ZONE_ENTRY_NOTIFICATION = {
  key: 'notified_zone_entry',
  radiusNm: ZONE_RADIUS_NM,
  message: (v) => `🚢 ${v.name} has entered the port zone (${v.port.arrival_port_name})`
};

const ARRIVAL_THRESHOLD_HOURS = 0.1; // 6 minutes
const ARRIVAL_SPEED_THRESHOLD = 0.5; // 0.5 knots
const MIN_SPEED_FOR_ETA_CALC = 0.1;

module.exports = {
  NOTIFICATION_THRESHOLDS,
  ZONE_ENTRY_NOTIFICATION,   // ✅ new
  ARRIVAL_THRESHOLD_HOURS,
  ARRIVAL_SPEED_THRESHOLD,
  MIN_SPEED_FOR_ETA_CALC,
};
