const cron = require('node-cron');
const path = require('path');
const { saveUsageSnapshot } = require('./snapshotUsage.job');
const { get } = require('http');

const DEFAULT_SCHEDULE = {
    cron: '0 8,12,15 * * *',
    timezone: 'Asia/Jakarta',
    maxAgeDays: 30,
};

const schedule = { ...DEFAULT_SCHEDULE };
let scheduledTask = null;
let lastRun = {
    status: 'idle',
    at: null,
    fileName: null,
    message: 'Waiting for the next schedule',
};

function getSchedule() {
    return { ...schedule, defaults: { ...DEFAULT_SCHEDULE } };
}

function getLastRun() {
    return { ...lastRun };
}

async function runSnapshotNow() {
    lastRun = {
        status: 'running',
        at: new Date().toISOString(),
        fileName: null,
        message: 'Saving snapshot...',
    };

    try {
        const filePath = await saveUsageSnapshot();
        const fileName = path.basename(filePath);
        lastRun = {
            status: 'success',
            at: new Date().toISOString(),
            fileName,
            message: `Snapshot saved to ${fileName}`,
        };
        return lastRun;
    } catch (err) {
        lastRun = {
            status: 'failed',
            at: new Date().toISOString(),
            fileName: null,
            message: err.message || 'Snapshot failed',
        };
        throw err;
    }
}

function isValidTimezone(timezone) {
    try {
        Intl.DateTimeFormat('en-US', { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
}

function applySchedule() {
    if (!cron.validate(schedule.cron)) {
        throw new Error('Invalid cron expression');
    }
    if (!isValidTimezone(schedule.timezone)) {
        throw new Error('Invalid timezone');
    }

    if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
    }

    scheduledTask = cron.schedule(
        schedule.cron,
        () => {
            runSnapshotNow().catch((err) => {
                console.error('Snapshot failed:', err.message);
            });
        },
        { timezone: schedule.timezone },
    );

    console.log(`Snapshot scheduled: ${schedule.cron} in ${schedule.timezone}`);
}

function updateSchedule(next) {
    const previous = { ...schedule };

    if (next.cron != null) schedule.cron = String(next.cron).trim();
    if (next.timezone != null) schedule.timezone = String(next.timezone).trim();
    if (next.maxAgeDays != null) schedule.maxAgeDays = Number(next.maxAgeDays);

    if (!Number.isFinite(schedule.maxAgeDays) || schedule.maxAgeDays < 0) {
        Object.assign(schedule, previous);
        throw new Error('Max age must be a positive number');
    }

    try {
        applySchedule();
    } catch (err) {
        Object.assign(schedule, previous);
        applySchedule();
        throw err;
    }

    return getSchedule();
}

function resetSchedule() {
    Object.assign(schedule, DEFAULT_SCHEDULE);
    applySchedule();
    return getSchedule();
}

function startJobs() {
    applySchedule();
}

module.exports = {
    startJobs,
    getSchedule,
    getLastRun,
    updateSchedule,
    resetSchedule,
    runSnapshotNow,
};
