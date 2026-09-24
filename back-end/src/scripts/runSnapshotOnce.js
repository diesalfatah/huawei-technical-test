const { saveUsageSnapshot } = require('../jobs/snapshotUsage.job');

saveUsageSnapshot()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });