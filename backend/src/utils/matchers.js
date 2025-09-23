const { normalizeDestination } = require("../../config/portAliases");

/**
 * Check if vessel destination matches the port UN/LOCODE
 * Supports aliases defined in portAliases config.
 *
 * @param {string} vesselDestination - destination string from API
 * @param {string} portUnlocode - canonical unlocode from DB
 * @returns {boolean}
 */
function isDestinationMatch(vesselDestination, portUnlocode) {
  if (!vesselDestination || !portUnlocode) return false;

  const normalizedDest = normalizeDestination(vesselDestination);
  const normalizedPort = normalizeDestination(portUnlocode);

  return normalizedDest === normalizedPort;
}

module.exports = { isDestinationMatch };
