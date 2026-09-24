<template>
    <button :class="`btn btn-solid btn-${color}`">{{ title }}</button>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: 'Button',
    },
    color: {
        type: String,
        default: 'primary', // primary, secondary, accent, info, success, warning, error
    },
});
</script>
