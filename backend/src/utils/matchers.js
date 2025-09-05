// utils/matchers.js
function isDestinationMatch(vesselDestination, portUnlocode) {
  if (!vesselDestination || !portUnlocode) return false;
  return vesselDestination.trim().toLowerCase() === portUnlocode.trim().toLowerCase();
}

module.exports = { isDestinationMatch };
