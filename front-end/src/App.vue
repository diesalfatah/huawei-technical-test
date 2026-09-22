<script setup>
import { ref, onMounted } from 'vue'
import { http } from './api/http'
import { useCounterStore } from './stores/counter'

const counter = useCounterStore()

const health = ref(null)
const loading = ref(false)
const error = ref('')

const fetchHealth = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await http.get('/health')
    health.value = data
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchHealth)
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6">
    <button class="btn btn-primary" @click="counter.increment">
      Count: {{ counter.count }}
    </button>

    <div class="card bg-base-200 w-96 shadow-md">
      <div class="card-body">
        <h2 class="card-title">API Health</h2>

        <span v-if="loading" class="loading loading-spinner"></span>

        <div v-else-if="error" role="alert" class="alert alert-error">
          {{ error }}
        </div>

        <pre v-else-if="health" class="bg-base-300 p-3 rounded-lg text-sm">{{ health }}</pre>

        <div class="card-actions justify-end">
          <button class="btn btn-sm" :disabled="loading" @click="fetchHealth">
            Refetch
          </button>
        </div>
      </div>
    </div>
  </div>
</template>