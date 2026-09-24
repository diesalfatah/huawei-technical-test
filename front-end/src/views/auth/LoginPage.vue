<template>
    <main
        class="min-h-screen flex items-center justify-center bg-slate-100 p-4"
    >
        <form
            class="w-full max-w-md bg-white border border-slate-200 p-6 space-y-4"
            @submit.prevent="onSubmit"
        >
            <h1 class="text-2x1 font-semibold text-slate-900">
                Subscriber Usage Console
            </h1>
            <p class="text-sm text-slate-600">
                Sign in to manage usage records.
            </p>

            <label class="block space-y-1">
                <span class="text-sm text-slate-700">  
                    Username
                    <input
                        v-model.trim="username"
                        class="input input-bordered w-full"
                        autocomplete="username"
                        required
                    />
                </span>
            </label>

            <label class="block space-y-1">
                <span class="text-sm text-slate-700">
                    Password
                    <input
                        v-model.trim="password"
                        class="input input-bordered w-full"
                        autocomplete="current-password"
                        required
                    />
                </span>
            </label>

            <p v-if="auth.error" class="text-sm text-red-600">
                {{ auth.error }}
            </p>

            <button
                class="btn btn=neutral w-full"
                type="submit"
                :disabled="auth.loading"
            >
                {{ auth.loading ? 'Signing in...' : 'Sign in' }}
            </button>

            <p class="text-xs text-slate-500">
                Demo: admin / admin123 &nbsp;|&nbsp; operator / op123456
            </p>
        </form>
    </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('admin')
const password = ref('admin123')

async function onSubmit() {
    const ok = await auth.login(username.value, password.value)
    if (!ok) return

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/usage'
    router.replace(redirect)
}
</script>