import { http } from '../http';

export async function getSnapshots() {
    const { data } = await http.get('/snapshots');
    return data;
}

export async function updateSnapshotSchedule(payload) {
    const { data } = await http.put('/snapshots/schedule', payload);
    return data;
}

export async function resetSnapshotSchedule() {
    const { data } = await http.post('/snapshots/schedule/reset');
    return data;
}

export async function runSnapshot() {
    const { data } = await http.post('/snapshots/run');
    return data;
}

export async function cleanupSnapshots() {
    const { data } = await http.post('/snapshots/cleanup');
    return data;
}

export async function downloadSnapshot(fileName) {
    const { data } = await http.get(
        `/snapshots/${encodeURIComponent(fileName)}`,
        {
            responseType: 'blob',
        },
    );

    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
