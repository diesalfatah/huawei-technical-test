const usageStore = require('../../data/usageStore');

function deleteUsage(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'ID must be a positive integer',
        });
    }

    const deleted = usageStore.deleteUsageById(id);

    if (!deleted) {
        return res.status(404).json({
            error: 'Usage record not found',
        });
    }

    return res.status(204).send();
}

module.exports = {
    deleteUsage,
};
