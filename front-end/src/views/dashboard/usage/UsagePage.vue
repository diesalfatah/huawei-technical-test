<template>
    <section class="space-y-4">
        <div class="flex flex-warp gap-3 items-end">
            <fieldset class="fieldset l">
                <legend class="fieldset-legend">Search</legend>
                <input
                    v-model.trim="filterSubscriberId"
                    @change="loadData"
                    type="text"
                    class="input rounded-lg"
                    placeholder="Search by subscriber ID"
                />
            </fieldset>
            <button
                class="btn btn-primary rounded-lg shadow-none border-none ml-auto"
                @click="openCreate"
            >
                + New usage
            </button>
        </div>

        <p v-if="pageError" class="text-red-600">{{ pageError }}</p>
        <p v-if="loading" class="text-slate-500">Loading...</p>

        <UsageTable
            :rows="records"
            :can-delete="auth.isAdmin"
            @edit="openEdit"
            @remove="onRemove"
        />

        <UsageFormModal
            :open="modalOpen"
            :initial="editing"
            :saving="saving"
            :error="formError"
            @close="closeModal"
            @submit="onSubmitForm"
        />
    </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UsageTable from '../../../components/usage/UsageTable.vue';
import UsageFormModal from '../../../components/usage/UsageFormModal.vue';
import { getListUsage } from '../../../api/usage/getListUsage';
import { deleteUsage } from '../../../api/usage/deleteUsage';
import { createUsage } from '../../../api/usage/createUsage';
import { updateUsage } from '../../../api/usage/updateUsage';

const auth = useAuthStore();

const records = ref([]);
const loading = ref(false);
const saving = ref(false);
const pageError = ref('');
const formError = ref('');
const filterSubscriberId = ref('');

const modalOpen = ref(false);
const editing = ref(null);

async function loadData() {
    loading.value = true;
    pageError.value = '';
    try {
        records.value = await getListUsage(
            filterSubscriberId.value || undefined,
        );
    } catch (e) {
        pageError.value =
            e.response?.data?.error || e.message || 'Failed to load usage data';
    } finally {
        loading.value = false;
    }
}

function clearFilter() {
    filterSubscriberId.value = '';
    loadData();
}

function openCreate() {
    editing.value = null;
    formError.value = '';
    modalOpen.value = true;
}

function openEdit(row) {
    editing.value = row;
    formError.value = '';
    modalOpen.value = true;
}

function closeModal() {
    modalOpen.value = false;
    editing.value = null;
    formError.value = '';
}

async function onSubmitForm(payload) {
    saving.value = true;
    formError.value = '';
    try {
        if (editing.value?.id) {
            await updateUsage(editing.value.id, payload);
        } else {
            await createUsage(payload);
        }
        closeModal();
        await loadData();
    } catch (e) {
        formError.value = e.response?.data?.error || 'Save failed';
    } finally {
        saving.value = false;
    }
}

async function onRemove(row) {
    const ok = window.confirm(`Delete usage ${row.id}?`);
    if (!ok) return;
    try {
        await deleteUsage(row.id);
        await loadData();
    } catch (e) {
        pageError.value = e.response?.data?.error || 'Delete failed';
    }
}

watch(() => filterSubscriberId.value, loadData);

onMounted(loadData);
</script>
