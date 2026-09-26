const usageStore = require('../../data/usageStore');

function getUsage(req, res) {
    const { subscriberId } = req.query;

    const records = subscriberId ? usageStore.getUsageBySubscriber(subscriberId) : usageStore.getAllUsage();

    if (!records || records.length === 0) {
        return res.status(404).json({
            error: 'Record not found',
            message: 'No usage records found',
            status: 404,
        });
    }

    return res.status(200).json({
        message: 'Usage records retrieved',
        status: 200,
        records,
    });
}

module.exports = {
    getUsage,
};
