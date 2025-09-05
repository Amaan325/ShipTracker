// utils/eta.js
// Haversine formula to calculate distance (in km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ETA in hours based on vessel position, port position & speed
function calculateEtaHours(vesselData, port) {
  const distanceKm = haversineDistance(
    vesselData.latitude,
    vesselData.longitude,
    port.latitude,
    port.longitude
  );
  const speedKmh = (vesselData.sog || 10) * 1.852; // knots → km/h
  if (speedKmh < 0.5) return Infinity; // avoid divide by near-zero
  return distanceKm / speedKmh;
}

// Distance to port in nautical miles
function calculateDistanceToPort(vesselData, port) {
  const distanceKm = haversineDistance(
    vesselData.latitude,
    vesselData.longitude,
    port.latitude,
    port.longitude
  );
  return distanceKm / 1.852; // km → nautical miles
}

module.exports = { calculateEtaHours, calculateDistanceToPort };
