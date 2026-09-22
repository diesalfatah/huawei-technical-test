const usageStore = require('../../data/usageStore');

function createUsage(req, res) {
    const { subscriberId, callMinutes, smsCount, dataUsageMB } = req.body ?? {};

    // SECTION VALIDATION
    if (!subscriberId || callMinutes == null || smsCount == null || dataUsageMB == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const record = usageStore.addUsage({
        subscriberId,
        callMinutes,
        smsCount,
        dataUsageMB,
    });

    return res.status(201).json(record);
}

module.exports = {
    createUsage,
};
