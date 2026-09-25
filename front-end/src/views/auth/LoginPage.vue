<template>
    <main class="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div class="card bg-base-100 rounded-xl shadow-lg">
            <div class="card-body">
                <form
                    class="w-full max-w-md p-6 space-y-4"
                    @submit.prevent="onSubmit"
                >
                    <h1 class="text-3x1 font-semibold">
                        Login to your account
                    </h1>
                    <p class="text-sm text-slate-600">
                        Sign in to manage usage records and see my answered
                        questions.
                    </p>

                    <fieldset class="fieldset l">
                        <legend class="fieldset-legend">Username</legend>
                        <input
                            v-model.trim="username"
                            type="text"
                            class="input w-full"
                            placeholder="Type here"
                            autocomplete="username"
                            required
                        />
                    </fieldset>

                    <fieldset class="fieldset l">
                        <legend class="fieldset-legend">Password</legend>
                        <input
                            v-model.trim="password"
                            type="password"
                            class="input w-full"
                            placeholder="Type here"
                            autocomplete="current-password"
                            required
                        />
                    </fieldset>

                    <p v-if="auth.error" class="text-sm text-red-600">
                        {{ auth.error }}
                    </p>

                    <button
                        class="btn btn-primary w-full"
                        type="submit"
                        :disabled="auth.loading"
                    >
                        {{ auth.loading ? 'Signing in...' : 'Sign in' }}
                    </button>

                    <p class="text-xs text-slate-500">
                        Demo: admin / admin123 &nbsp;|&nbsp; operator / op123456
                    </p>
                </form>
            </div>
        </div>
    </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref('admin');
const password = ref('admin123');

onMounted(() => {
    document.title = 'Sign in · Usage Console';
});

async function onSubmit() {
    const ok = await auth.login(username.value, password.value);
    if (!ok) return;

    const redirect =
        typeof route.query.redirect === 'string'
            ? route.query.redirect
            : '/dashboard/usage';
    router.replace(redirect);
}
</script>
