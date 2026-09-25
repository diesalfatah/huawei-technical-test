const fs = require('fs');
const path = require('path');
const { SNAPSHOT_DIR } = require('../../jobs/snapshotUsage.job');
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
    res.json({
        schedule: jobs.getSchedule(),
        lastRun: jobs.getLastRun(),
        files: listSnapshotFiles(),
    });
}

function updateSnapshotSchedule(req, res) {
    try {
        const schedule = jobs.updateSchedule(req.body || {});
        res.json({ schedule, lastRun: jobs.getLastRun() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

function resetSnapshotSchedule(req, res) {
    const schedule = jobs.resetSchedule();
    res.json({ schedule, lastRun: jobs.getLastRun() });
}

async function runSnapshot(req, res) {
    try {
        const lastRun = await jobs.runSnapshotNow();
        res.status(201).json({ lastRun, files: listSnapshotFiles() });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Snapshot failed' });
    }
}

function cleanupSnapshotFiles(req, res) {
    const { maxAgeDays } = jobs.getSchedule();
    const result = cleanupSnapshots(maxAgeDays);
    res.json({ ...result, maxAgeDays, files: listSnapshotFiles() });
}

function downloadSnapshot(req, res) {
    const fileName = req.params.fileName;

    if (!isSafeFileName(fileName)) {
        return res.status(400).json({ error: 'Invalid file name' });
    }

    const filePath = path.join(SNAPSHOT_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
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
