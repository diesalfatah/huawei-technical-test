const fs = require('fs');
const path = require('path');

const SNAPSHOT_DIR = path.join(__dirname, '../../snapshots');
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function cleanupSnapshots() {
    if (!fs.existsSync(SNAPSHOT_DIR)) {
        console.log('[cleanup] snapshots folder does not exist');
        return;
    }

    const now = Date.now();
    let deleted = 0;

    for (const file of fs.readdirSync(SNAPSHOT_DIR)) {
        if (!file.endsWith('.csv')) continue;

        const fullPath = path.join(SNAPSHOT_DIR, file);
        const age = now - fs.statSync(fullPath).mtimeMs;

        if (age > MAX_AGE_MS) {
            fs.unlinkSync(fullPath);
            deleted += 1;
            console.log(`[cleanup] deleted ${file}`);
        }
    }

    console.log(`[cleanup] done. deleted=${deleted}`);
}

cleanupSnapshots();