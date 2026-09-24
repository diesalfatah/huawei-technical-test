const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SNAPSHOT_DIR = path.join(__dirname, '..', 'snapshots');
const API_URL = process.env.SNAPSHOT_API_URL || 'http://localhost:3000/api/usage';

function toCsv(records) {
    const headers = ['id', 'subscriberId', 'callMinutes', 'smsCount', 'dataUsageMB', 'timestamp'];
    const lines = [headers.join(',')];

    for (const row of records) {
        const cols = headers.map((key) => {
            const raw = row[key] == null ? '' : String(row[key]);
            return `"${raw.replace('"', '""')}"`;
        });
        lines.push(cols.join(','));
    }
    return lines.join('\n');
}

function buildFileName() {
    
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(new Date());

    const get = (type) => parts.find((p) => p.type === type)?.value;
    return `usage-${get('year')}${get('month')}${get('day')}-${get('hour')}${get('minute')}${get('second')}-WIB.csv`;
}

async function saveUsageSnapshot() {
    if (!fs.existsSync(SNAPSHOT_DIR)) {
        fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    }

    const { data } = await axios.get(API_URL);
    const fileName = buildFileName();
    const filePath = path.join(SNAPSHOT_DIR, fileName);

    fs.writeFileSync(filePath, toCsv(data), 'utf8');
    console.log(`Snapshot saved: ${fileName}`);
    return filePath;
}

module.exports = {
    saveUsageSnapshot,
    toCsv,
    buildFileName,
};
