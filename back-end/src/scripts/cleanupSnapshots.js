const fs = require('fs');
const path = require('path');
const { SNAPSHOT_DIR } = require('../jobs/snapshotUsage.job');

function cleanupSnapshots(maxAgeDays = 30) {
    if (!fs.existsSync(SNAPSHOT_DIR)) {
        console.log('Folder does not exist');
        return { deleted: 0, files: [] };
    }

    const maxAgeMs = Number(maxAgeDays) * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const deletedFiles = [];

    for (const file of fs.readdirSync(SNAPSHOT_DIR)) {
        if (!file.endsWith('.csv')) continue;

        const fullPath = path.join(SNAPSHOT_DIR, file);
        const age = now - fs.statSync(fullPath).mtimeMs;

        if (age > maxAgeMs) {
            fs.unlinkSync(fullPath);
            deletedFiles.push(file);
            console.log(`${file} deleted`);
        }
    }

    console.log(`${deletedFiles.length} files deleted`);
    return { deleted: deletedFiles.length, files: deletedFiles };
}

if (require.main === module) {
    cleanupSnapshots();
}

module.exports = { cleanupSnapshots };
