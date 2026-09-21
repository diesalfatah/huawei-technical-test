<script setup>
import { ref } from 'vue'
import { useCounterStore } from './stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <button class="btn btn-primary" @click="counter.increment">
      Count: {{ counter.count }}
    </button>
  </div>
</template>