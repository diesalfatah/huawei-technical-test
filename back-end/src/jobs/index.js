const cron = require('node-cron');
const { saveUsageSnapshot } = require('./snapshotUsage.job');

function startJobs() {
    // 08:00, 12:00. 15:00 Asia/Jakarta (WIB)
    cron.schedule(
        '0 8,12,15 * * *',
        () => {
            saveUsageSnapshot().catch((err) => {
                console.error('[snapshot] failed:', err.message);
            });
        },
        { timezone: 'Asia/Jakarta' },
    );

    console.log('[jobs] snapshot cron registered (08:00/12:00/15:00 WIB)');
}

module.exports = { startJobs };
