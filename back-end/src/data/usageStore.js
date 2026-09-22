// SECTION IN-MEMORY DATA STORE
const { createUsageSeed } = require('./seeder/usageSeed');

// Isi penyimpanan dengan data awal.
let usageRecords = createUsageSeed();

// ID berikutnya adalah ID terbesar + 1.
let idCounter =
  Math.max(0, ...usageRecords.map((record) => record.id)) + 1;

// SECTION CRUD FUNCTIONS
function addUsage({ subscriberId, callMinutes, smsCount, dataUsageMB }) {
  const record = {
    id: idCounter++,
    subscriberId,
    callMinutes,
    smsCount,
    dataUsageMB,
    timestamp: new Date().toISOString(),
  };
  usageRecords.push(record);
  return record;
}

function getAllUsage() {
  return usageRecords;
}

function getUsageBySubscriber(subscriberId) {
  return usageRecords.filter((r) => r.subscriberId === subscriberId);
}

function updateUsageById(id, changes) {
  const record = usageRecords.find((record) => record.id === id);

  if (!record) {
    return null;
  }

  Object.assign(record, changes);

  return record;
}

function deleteUsageById(id) {
  const index = usageRecords.findIndex((record) => record.id === id);

  if (index === -1) {
    return false;
  }

  usageRecords.splice(index, 1);

  return true;
}

module.exports = { addUsage, getAllUsage, getUsageBySubscriber, updateUsageById, deleteUsageById, createUsageSeed };