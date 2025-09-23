/**
 * Port Aliases Config
 *
 * Maps different API destination strings (aliases) to a canonical UN/LOCODE.
 * Example: "NLRTM ECT" → "NLRTM"
 *
 * Use normalizeDestination(rawDest) to standardize API inputs.
 */

const PORT_ALIASES = {
  // === Rotterdam ===
  "NLRTM": "NLRTM",           // Canonical
  "ROTTERDAM": "NLRTM",       // Alias
  "PORTOFROTTERDAM": "NLRTM", // Alias
  "PORT OF ROTTERDAM": "NLRTM", // Alias

  // === Antwerp ===
  "BEANR": "BEANR",           // Canonical
  "ANTWERP": "BEANR",         // Alias
  "PORTOFANTWERP": "BEANR",   // Alias
  "PORT OF ANTWERP": "BEANR", // Alias

  // === Zeebrugge ===
  "BEZEE": "BEZEE",             // Canonical
  "ZEEBRUGGE": "BEZEE",         // Alias
  "PORTOFZEEBRUGGE": "BEZEE",   // Alias
  "PORT OF ZEEBRUGGE": "BEZEE", // Alias

  // === Barcelona ===
  "ESBCN": "ESBCN",             // Canonical
  "BARCELONA": "ESBCN",         // Alias
  "PORTOFBARCELONA": "ESBCN",   // Alias
  "PORT OF BARCELONA": "ESBCN", // Alias

  // === Valencia ===
  "ESVLC": "ESVLC",             // Canonical
  "VALENCIA": "ESVLC",          // Alias
  "PORTOFVALENCIA": "ESVLC",    // Alias
  "PORT OF VALENCIA": "ESVLC",  // Alias

  // === Las Palmas ===
  "ESLPA": "ESLPA",             // Canonical
  "LASPALMAS": "ESLPA",         // Alias
  "PORTOFLASPALMAS": "ESLPA",   // Alias
  "PORT OF LAS PALMAS": "ESLPA" // Alias
};

/**
 * Extracts the last 5 alphanumeric characters (ignoring spaces/symbols)
 *
 * Example:
 *   "BEA NR -----> ESBCN" → "ESBCN"
 *   "BE ANR BEZ EE" → "BEZEE"
 *
 * @param {string} text
 * @returns {string|null} last 5-char UNLOCODE candidate
 */
function extractLastUnlocode(text) {
  if (!text) return null;
  // Remove all spaces and non-alphanumeric characters
  const cleaned = text.replace(/[^A-Z0-9]/gi, "");
  if (cleaned.length < 5) return null;
  return cleaned.slice(-5).toUpperCase();
}

/**
 * Normalize an API destination string into a canonical UN/LOCODE
 *
 * Handles:
 *  - Messy strings with spaces, arrows, slashes, dashes
 *  - Extracts last 5 alphanumeric chars as fallback
 *  - Maps aliases like "ANTWERP" → "BEANR"
 *
 * @param {string} rawDest - Destination string from AIS/VF API
 * @returns {string|null} Canonical UN/LOCODE if found, else raw cleaned string
 */
function normalizeDestination(rawDest) {
  if (!rawDest) return null;

  let dest = rawDest.trim().toUpperCase();

  // First check aliases directly
  const noSpaces = dest.replace(/\s+/g, "");
  if (PORT_ALIASES[dest]) return PORT_ALIASES[dest];
  if (PORT_ALIASES[noSpaces]) return PORT_ALIASES[noSpaces];

  // Try extracting last 5 alphanumeric chars
  const lastCode = extractLastUnlocode(dest);
  if (lastCode && PORT_ALIASES[lastCode]) {
    return PORT_ALIASES[lastCode];
  }

  // If last 5 look like UN/LOCODE but not mapped, return them anyway
  if (lastCode) return lastCode;

  // Fallback: raw cleaned string
  return noSpaces;
}

module.exports = {
  PORT_ALIASES,
  normalizeDestination,
};
