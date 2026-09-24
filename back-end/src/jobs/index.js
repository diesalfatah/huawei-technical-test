const cron = require('node-cron');
const { saveUsageSnapshot } = require('./snapshotUsage.job');

function startJobs() {
    
    cron.schedule(
        '0 8,12,15 * * *',
        () => {
            saveUsageSnapshot().catch((err) => {
                console.error('[snapshot] failed:', err.message);
            });
        },
        { timezone: 'Asia/Jakarta' },
    );

    console.log('Automatic snapshot registered');
}

module.exports = { startJobs };
