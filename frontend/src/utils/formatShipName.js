// src/utils/format.js

/**
 * Format ship name:
 * - First word fully uppercase
 * - Other words capitalized only first letter
 * Example: "MSC TITANIXX" → "MSC Titanixx"
 */
export const formatShipName = (name) => {
  if (!name) return "-";
  const words = name.split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

  const firstWord = words[0].toUpperCase();
  const rest = words
    .slice(1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return `${firstWord} ${rest}`;
};

/**
 * Capitalize first letter of a word, lowercase the rest
 * Example: "jack" → "Jack"
 */
export const toTitleCase = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
