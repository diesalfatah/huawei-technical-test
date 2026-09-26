const usageStore = require('../../data/usageStore');

function deleteUsage(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'ID is invalid',
            message: 'ID must be a positive integer',
            status: 400,
        });
    }

    const deleted = usageStore.deleteUsageById(id);

    if (!deleted) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Usage record not found',
            status: 404,
        });
    }

    return res.status(200).json({
        message: 'Usage record deleted',
        status: 200,
    });
}

module.exports = {
    deleteUsage,
};
