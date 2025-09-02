// utils/eta.js
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateEtaHours(vessel, port) {
  const distanceKm = haversineDistance(
    vessel.latitude,
    vessel.longitude,
    port.latitude,
    port.longitude
  );
  const speedKmh = (vessel.sog || 10) * 1.852;
  // knots -> km/h
  return distanceKm / (speedKmh || 1);
}

module.exports = { calculateEtaHours };
