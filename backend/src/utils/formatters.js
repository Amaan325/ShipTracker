// utils/formatters.js
function normalizePhoneNumber(phone) {
  return phone ? phone.replace(/^\+/, "") : "";
}

function formatEtaHours(h) {
  const mins = Math.round(h * 60);
  return `${h.toFixed(2)} hours (~${mins} minutes)`;
}

module.exports = { normalizePhoneNumber, formatEtaHours };
