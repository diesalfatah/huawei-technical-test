// SECTION IMPORTS
const usageStore = require('../../data/usageStore');

// GET ALL USAGE OR FILTER BY SUBSCRIBER ID
function getUsage(req, res) {
    const { subscriberId } = req.query;

    const records = subscriberId ? usageStore.getUsageBySubscriber(subscriberId) : usageStore.getAllUsage();

    return res.status(200).json(records);
}

module.exports = {
    getUsage,
};
