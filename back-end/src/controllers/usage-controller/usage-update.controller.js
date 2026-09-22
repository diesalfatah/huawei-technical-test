// SECTION IMPORTS
const usageStore = require('../../data/usageStore');

function updateUsage(req, res) {
    const id = Number(req.params.id);

    // ID pada proyek ini adalah bilangan bulat positif.
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'ID must be a positive integer',
        });
    }

    const body = req.body;

    // Body harus berupa object JSON.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
            error: 'Request body must be a JSON object',
        });
    }

    const allowedFields = ['subscriberId', 'callMinutes', 'smsCount', 'dataUsageMB'];

    const fields = Object.keys(body);

    if (fields.length === 0) {
        return res.status(400).json({
            error: 'Provide at least one field to update',
        });
    }

    // Mencegah perubahan id, timestamp, atau field tidak dikenal.
    if (fields.some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({
            error: 'Request contains a field that cannot be updated',
        });
    }

    const changes = {};

    for (const field of fields) {
        const value = body[field];

        if (field === 'subscriberId') {
            if (typeof value !== 'string' || value.trim() === '') {
                return res.status(400).json({
                    error: 'subscriberId must be a non-empty string',
                });
            }

            changes[field] = value.trim();
        } else {
            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
                return res.status(400).json({
                    error: `${field} must be a non-negative number`,
                });
            }

            if (field === 'smsCount' && !Number.isSafeInteger(value)) {
                return res.status(400).json({
                    error: 'smsCount must be a non-negative safe integer',
                });
            }

            changes[field] = value;
        }
    }

    const record = usageStore.updateUsageById(id, changes);

    if (!record) {
        return res.status(404).json({
            error: 'Usage record not found',
        });
    }

    return res.status(200).json(record);
}

module.exports = {
    updateUsage,
};
