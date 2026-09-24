<template>
    <div class="overflow-x-auto border border-slate-200 bg-white">
        <table class="table w-full">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Subscriber</th>
                    <th>Call</th>
                    <th>SMS</th>
                    <th>Data</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!rows.length">
                    <td colspan="7" class="text-center text-slate-500">
                        No usage records found
                    </td>
                </tr>
                <tr v-for="row in rows" :key="row.id">
                    <td>{{ row.id }}</td>
                    <td>{{ row.subscriberId }}</td>
                    <td>{{ row.callMinutes }}</td>
                    <td>{{ row.smsCount }}</td>
                    <td>{{ row.dataUsageMB }}</td>
                    <td class="text-xs">{{ row.timestamp }}</td>
                    <td class="space-x-2">
                        <button class="btn btn-xs" @click="$emit('edit', row)">
                            Edit
                        </button>
                        <button
                            v-if="canDelete"
                            class="btn btn-xs btn-error"
                            @click="$emit('remove', row)"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
defineProps({
    rows: { type: Array, default: () => [] },
    canDelete: { type: Boolean, default: false },
});

defineEmits(['edit', 'remove']);
</script>
