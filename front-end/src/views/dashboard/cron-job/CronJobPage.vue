<template>
    <section class="space-y-4">
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-4">
                <div>
                    <h2 class="card-title text-base">Snapshot schedule</h2>
                    <p class="text-sm opacity-70">
                        Default is 08:00, 12:00, and 15:00. Timezone is
                        Asia/Jakarta.
                    </p>
                </div>

                <div class="grid gap-3 md:grid-cols-2">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">
                            Snapshot times (Asia/Jakarta · WIB)
                        </legend>
                        <div class="flex flex-col gap-2">
                            <div
                                v-for="(time, index) in form.times"
                                :key="index"
                                class="flex items-center gap-2"
                            >
                                <input
                                    v-model="form.times[index]"
                                    type="time"
                                    class="input w-full"
                                />
                                <button
                                    type="button"
                                    class="btn btn-ghost btn-square btn-sm"
                                    :disabled="form.times.length <= 1"
                                    @click="removeTime(index)"
                                >
                                    ✕
                                </button>
                            </div>
                            <button
                                type="button"
                                class="btn btn-outline btn-sm w-fit"
                                @click="addTime"
                            >
                                + Add time
                            </button>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">
                            Delete CSV older than (days)
                        </legend>
                        <input
                            v-model.number="form.maxAgeDays"
                            type="number"
                            min="0"
                            class="input w-full"
                        />
                    </fieldset>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button
                        class="btn btn-primary"
                        :disabled="saving"
                        @click="onSaveSchedule"
                    >
                        {{ saving ? 'Saving...' : 'Save Schedule' }}
                    </button>
                    <button
                        class="btn btn-ghost"
                        :disabled="saving"
                        @click="onResetSchedule"
                    >
                        Reset to default
                    </button>
                    <button
                        class="btn btn-success"
                        :disabled="running"
                        @click="onRunNow"
                    >
                        {{ running ? 'Running...' : 'Save Now' }}
                    </button>
                    <button
                        class="btn btn-warning"
                        :disabled="cleaning"
                        @click="onCleanup"
                    >
                        {{ cleaning ? 'Cleaning...' : 'Delete Old Files' }}
                    </button>
                </div>

                <p v-if="pageError" class="text-sm text-red-600">
                    {{ pageError }}
                </p>
                <p class="text-sm">
                    Last save:
                    <span
                        v-if="lastRun.status !== 'success'"
                        class="badge badge-ghost badge-sm"
                        >{{ lastRun.status }}</span
                    >
                    <span v-else class="badge badge-success badge-sm">
                        {{ lastRun.status }}
                    </span>

                    {{ lastRun.message }}

                    <span v-if="lastRun.at" class="opacity-60">
                        · {{ formatJakartaDateTime(lastRun.at) }}</span
                    >
                </p>
            </div>
        </div>

        <div
            class="overflow-x-auto border border-slate-200 bg-white rounded-xl"
        >
            <table class="table w-full table-zebra">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Size</th>
                        <th>Updated</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="files.length === 0">
                        <td colspan="4" class="opacity-60">
                            No snapshot files yet.
                        </td>
                    </tr>
                    <tr v-for="file in files" :key="file.fileName">
                        <td>{{ file.fileName }}</td>
                        <td>{{ file.size }}</td>
                        <td>{{ formatJakartaDateTime(file.updatedAt) }}</td>
                        <td>
                            <button
                                class="btn btn-success btn-square btn-xs"
                                @click="onDownload(file.fileName)"
                            >
                                <Download class="w-3 h-3" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import {
    cleanupSnapshots,
    downloadSnapshot,
    getSnapshots,
    resetSnapshotSchedule,
    runSnapshot,
    updateSnapshotSchedule,
} from '../../../api/snapshots/snapshots';
import { Download } from '@lucide/vue';

const DEFAULT_TIMES = ['08:00', '12:00', '15:00'];
const JAKARTA_TIMEZONE = 'Asia/Jakarta';

const form = reactive({
    times: [...DEFAULT_TIMES],
    timezone: JAKARTA_TIMEZONE,
    maxAgeDays: 30,
});

const files = ref([]);
const lastRun = reactive({
    status: 'idle',
    at: null,
    message: 'Waiting for the next scheduler',
});

const pageError = ref('');
const saving = ref(false);
const running = ref(false);
const cleaning = ref(false);
const formReady = ref(false);

let timerId = null;

function pad2(n) {
    return String(n).padStart(2, '0');
}

/** ISO date → "DD-MM-YYYY HH:mm:ss" in Asia/Jakarta */
function formatJakartaDateTime(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: JAKARTA_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date);

    const get = (type) => parts.find((p) => p.type === type)?.value || '00';
    return `${get('day')}-${get('month')}-${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

/** cron "0 8,12,15 * * *" → ["08:00", "12:00", "15:00"] */
function cronToTimes(cron) {
    const parts = String(cron || '')
        .trim()
        .split(/\s+/);
    if (parts.length < 2) return [...DEFAULT_TIMES];

    const minute = Number(parts[0]);
    const hours = parts[1]
        .split(',')
        .map((h) => Number(h))
        .filter((h) => Number.isInteger(h) && h >= 0 && h <= 23);

    if (
        !Number.isInteger(minute) ||
        minute < 0 ||
        minute > 59 ||
        hours.length === 0
    ) {
        return [...DEFAULT_TIMES];
    }

    return hours.map((hour) => `${pad2(hour)}:${pad2(minute)}`);
}

/** ["08:00", "12:00", "15:00"] → cron "0 8,12,15 * * *" */
function timesToCron(times) {
    const parsed = times
        .map((t) => String(t || '').trim())
        .filter(Boolean)
        .map((t) => {
            const [h, m] = t.split(':').map(Number);
            return { hour: h, minute: m };
        })
        .filter(
            ({ hour, minute }) =>
                Number.isInteger(hour) &&
                Number.isInteger(minute) &&
                hour >= 0 &&
                hour <= 23 &&
                minute >= 0 &&
                minute <= 59,
        );

    if (parsed.length === 0) {
        throw new Error('Add at least one valid snapshot time');
    }

    const minute = parsed[0].minute;
    if (parsed.some((t) => t.minute !== minute)) {
        throw new Error(
            'All snapshot times must use the same minutes (e.g. all :00)',
        );
    }

    const uniqueHours = [...new Set(parsed.map((t) => t.hour))].sort(
        (a, b) => a - b,
    );
    return `${minute} ${uniqueHours.join(',')} * * *`;
}

function addTime() {
    form.times.push('08:00');
}

function removeTime(index) {
    if (form.times.length <= 1) return;
    form.times.splice(index, 1);
}

function fillForm(schedule) {
    form.times = cronToTimes(schedule.cron);
    // Always keep Jakarta as the app timezone
    form.timezone = JAKARTA_TIMEZONE;
    form.maxAgeDays = schedule.maxAgeDays;
}

function applyStatus(data, updateForm) {
    if (updateForm && data.schedule) fillForm(data.schedule);
    if (data.lastRun) Object.assign(lastRun, data.lastRun);
    if (data.files) files.value = data.files;
}

async function loadStatus() {
    try {
        const data = await getSnapshots();
        applyStatus(data, !formReady.value);
        formReady.value = true;
        pageError.value = '';
    } catch (e) {
        pageError.value = e.response?.data?.error || 'Failed to load snapshot';
    }
}

async function onSaveSchedule() {
    saving.value = true;
    pageError.value = '';
    try {
        const cron = timesToCron(form.times);
        const data = await updateSnapshotSchedule({
            cron,
            timezone: JAKARTA_TIMEZONE,
            maxAgeDays: form.maxAgeDays,
        });
        applyStatus(data, true);
    } catch (e) {
        pageError.value =
            e.response?.data?.error || e.message || 'Failed to save schedule';
    } finally {
        saving.value = false;
    }
}

async function onResetSchedule() {
    saving.value = true;
    pageError.value = '';
    try {
        const data = await resetSnapshotSchedule();
        applyStatus(data, true);
    } catch (e) {
        pageError.value = e.response?.data?.error || 'Failed to reset schedule';
    } finally {
        saving.value = false;
    }
}

async function onRunNow() {
    running.value = true;
    pageError.value = '';
    try {
        const data = await runSnapshot();
        applyStatus(data, false);
    } catch (e) {
        pageError.value = e.response?.data?.error || 'Failed to run snapshot';
        await loadStatus();
    } finally {
        running.value = false;
    }
}

async function onCleanup() {
    cleaning.value = true;
    pageError.value = '';
    try {
        const data = await cleanupSnapshots();
        files.value = data.files || [];
        lastRun.message = `Deleted ${data.deleted} file(s)`;
    } catch (e) {
        pageError.value = e.response?.data?.error || 'Delete failed';
    } finally {
        cleaning.value = false;
    }
}

async function onDownload(fileName) {
    try {
        await downloadSnapshot(fileName);
    } catch (e) {
        pageError.value = e.response?.data?.error || 'Download failed';
    }
}

onMounted(() => {
    loadStatus();
    timerId = setInterval(loadStatus, 5000);
});

onUnmounted(() => {
    clearInterval(timerId);
});
</script>
