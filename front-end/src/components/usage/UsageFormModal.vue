<template>
    <dialog class="modal" :class="{ 'modal-open': open }">
        <div class="modal-box space-y-3">
            <h3 class="font-bold text-lg">
                {{ isEdit ? 'Edit Usage' : 'Create Usage' }}
            </h3>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Subscriber ID</legend>
                <input
                    v-model.trim="form.subscriberId"
                    type="text"
                    class="input"
                    placeholder="Input subscriber ID"
                    required
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Call Minutes</legend>
                <input
                    v-model.number="form.callMinutes"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="Input call minutes"
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">SMS Count</legend>
                <input
                    v-model.number="form.smsCount"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="Input SMS count"
                />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Data Usage (MB)</legend>
                <input
                    v-model.number="form.smsCount"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="Input data usage in MB"
                />
            </fieldset>

            <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

            <div class="modal-action">
                <button class="btn" type="button" @click="$emit('close')">
                    Cancel
                </button>
                <button
                    class="btn btn-neutral"
                    type="button"
                    :disabled="saving"
                    @click="onSave"
                >
                    {{ saving ? 'Saving...' : 'Save' }}
                </button>
            </div>
        </div>

        <form method="dialog" class="modal-backdrop">
            <button type="button" @click="$emit('close')">Close</button>
        </form>
    </dialog>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';

const props = defineProps({
    open: Boolean,
    initial: { type: Object, default: null },
    saving: Boolean,
    error: { type: String, default: '' },
});

const emit = defineEmits(['close', 'submit']);

const isEdit = ref(false);
const form = reactive({
    subscriberId: '',
    callMinutes: 0,
    smsCount: 0,
    dataUsageMB: 0,
});

watch(
    () => props.initial,
    (value) => {
        if (value) {
            isEdit.value = true;
            form.subscriberId = value.subscriberId;
            form.callMinutes = value.callMinutes;
            form.smsCount = value.smsCount;
            form.dataUsageMB = value.dataUsageMB;
        } else {
            isEdit.value = false;
            form.subscriberId = '';
            form.callMinutes = 0;
            form.smsCount = 0;
            form.dataUsageMB = 0;
        }
    },
    { immediate: true },
);

function onSave() {
    emit('submit', { ...form });
}
</script>
