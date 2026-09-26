const usageStore = require('../../data/usageStore');

function updateUsage(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid ID',
            message: 'ID must be a positive integer',
            status: 400,
        });
    }

    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
            error: 'Invalid request body',
            message: 'Request body must be a JSON object',
            status: 400,
        });
    }

    const allowedFields = ['subscriberId', 'callMinutes', 'smsCount', 'dataUsageMB'];

    const fields = Object.keys(body);

    if (fields.length === 0) {
        return res.status(400).json({
            error: 'Invalid field(s)',
            message: 'Provide at least one field to update',
            status: 400,
        });
    }

    if (fields.some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({
            error: 'Request contains a field that cannot be updated',
            message: 'Only the following fields can be updated: subscriberId, callMinutes, smsCount, dataUsageMB',
            status: 400,
        });
    }

    const changes = {};

    for (const field of fields) {
        const value = body[field];

        if (field === 'subscriberId') {
            if (typeof value !== 'string' || value.trim() === '') {
                return res.status(400).json({
                    error: 'Invalid subscriberId',
                    message: 'Subscriber ID must be a non-empty string',
                    status: 400,
                });
            }

            changes[field] = value.trim();
        } else {
            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
                return res.status(400).json({
                    error: `${field} is invalid`,
                    message: `${field} must be a non-negative number`,
                    status: 400,
                });
            }

            if (field === 'smsCount' && !Number.isSafeInteger(value)) {
                return res.status(400).json({
                    error: 'Invalid SMS count',
                    message: 'SMS count must be a non-negative safe integer',
                    status: 400,
                });
            }

            changes[field] = value;
        }
    }

    const record = usageStore.updateUsageById(id, changes);

    if (!record) {
        return res.status(404).json({
            error: 'Usage record not found',
            message: 'Usage record not found',
            status: 404,
        });
    }

    return res.status(200).json({
        message: 'Usage record updated',
        status: 200,
        record,
    });
}

module.exports = {
    updateUsage,
};
