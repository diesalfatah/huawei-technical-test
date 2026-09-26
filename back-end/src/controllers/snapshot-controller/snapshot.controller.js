const fs = require('fs');
const path = require('path');
const { SNAPSHOT_DIR } = require('../../jobs/snapshotUsage.job');
const { cleanupSnapshots } = require('../../scripts/cleanupSnapshots');
const jobs = require('../../jobs');

function isSafeFileName(fileName) {
    return /^usage-\d{8}-\d{6}-WIB\.csv$/.test(fileName);
}

function listSnapshotFiles() {
    if (!fs.existsSync(SNAPSHOT_DIR)) return [];

    return fs
        .readdirSync(SNAPSHOT_DIR)
        .filter((file) => file.endsWith('.csv'))
        .map((fileName) => {
            const stat = fs.statSync(path.join(SNAPSHOT_DIR, fileName));
            return {
                fileName,
                size: stat.size,
                updatedAt: stat.mtime.toISOString(),
            };
        })
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

function getSnapshots(req, res) {
    return res.status(200).json({
        message: 'Snapshots retrieved',
        status: 200,
        schedule: jobs.getSchedule(),
        lastRun: jobs.getLastRun(),
        files: listSnapshotFiles(),
    });
}

function updateSnapshotSchedule(req, res) {
    try {
        const schedule = jobs.updateSchedule(req.body || {});
        return res.status(200).json({
            message: 'Snapshot schedule updated',
            status: 200,
            schedule,
            lastRun: jobs.getLastRun(),
        });
    } catch (err) {
        return res.status(400).json({
            error: 'Invalid schedule',
            message: err.message || 'Failed to update snapshot schedule',
            status: 400,
        });
    }
}

function resetSnapshotSchedule(req, res) {
    const schedule = jobs.resetSchedule();
    return res.status(200).json({
        message: 'Snapshot schedule reset to defaults',
        status: 200,
        schedule,
        lastRun: jobs.getLastRun(),
    });
}

async function runSnapshot(req, res) {
    try {
        const lastRun = await jobs.runSnapshotNow();
        return res.status(201).json({
            message: 'Snapshot created',
            status: 201,
            lastRun,
            files: listSnapshotFiles(),
        });
    } catch (err) {
        return res.status(500).json({
            error: 'Snapshot failed',
            message: err.message || 'Snapshot failed',
            status: 500,
        });
    }
}

function cleanupSnapshotFiles(req, res) {
    const { maxAgeDays } = jobs.getSchedule();
    const result = cleanupSnapshots(maxAgeDays);

    return res.status(200).json({
        message:
            result.deleted > 0 ? `Deleted ${result.deleted} old snapshot file(s)` : 'No old snapshot files to delete',
        status: 200,
        deleted: result.deleted,
        maxAgeDays,
        files: listSnapshotFiles(),
    });
}

function downloadSnapshot(req, res) {
    const fileName = req.params.fileName;

    if (!isSafeFileName(fileName)) {
        return res.status(400).json({
            error: 'Invalid file name',
            message: 'File name must match usage-YYYYMMDD-HHmmss-WIB.csv',
            status: 400,
        });
    }

    const filePath = path.join(SNAPSHOT_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: 'File not found',
            message: 'Snapshot file not found',
            status: 404,
        });
    }

    return res.download(filePath, fileName);
}

module.exports = {
    getSnapshots,
    updateSnapshotSchedule,
    resetSnapshotSchedule,
    runSnapshot,
    cleanupSnapshotFiles,
    downloadSnapshot,
};
