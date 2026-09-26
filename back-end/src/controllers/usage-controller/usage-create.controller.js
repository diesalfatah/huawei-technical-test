const usageStore = require('../../data/usageStore');

function createUsage(req, res) {
    const { subscriberId, callMinutes, smsCount, dataUsageMB } = req.body ?? {};

    if (!subscriberId || callMinutes == null || smsCount == null || dataUsageMB == null) {
        return res.status(400).json({
            error: 'Required fields are missing',
            message: 'Missing required fields',
            status: 400,
        });
    }

    const record = usageStore.addUsage({
        subscriberId,
        callMinutes,
        smsCount,
        dataUsageMB,
    });

    return res.status(201).json({
        message: 'Usage record created',
        status: 201,
        record,
    });
}

module.exports = {
    createUsage,
};
