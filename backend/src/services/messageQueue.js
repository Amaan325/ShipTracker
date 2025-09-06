const messageQueue = [];

function enqueueMessage(to, message, vesselName = null) {
  messageQueue.push({ to, message, vesselName, attempts: 0 });
  console.log(
    `📩 Queued message for ${to}: "${message}" | Queue length: ${messageQueue.length}`
  );
}

function dequeueMessage() {
  return messageQueue.shift();
}

function getQueueLength() {
  return messageQueue.length;
}

/**
 * Mark all thresholds before the given key as true
 */
function markAllPriorNotifications(vessel, currentKey, thresholds) {
  const index = thresholds.findIndex((t) => t.key === currentKey);
  if (index === -1) return;
  for (let i = 0; i <= index; i++) {
    vessel[thresholds[i].key] = true;
  }
}

module.exports = {
  enqueueMessage,
  dequeueMessage,
  getQueueLength,
  markAllPriorNotifications,
};
