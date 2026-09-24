<template>
    <div class="drawer lg:drawer-open">
        <input
            id="dashboard-drawer"
            v-model="drawerOpen"
            type="checkbox"
            class="drawer-toggle"
        />

        <div class="drawer-content min-h-screen bg-base-200">
            <nav class="navbar w-full bg-base-300">
                <label
                    for="dashboard-drawer"
                    aria-label="open sidebar"
                    class="btn btn-square btn-primary drawer-button"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="2"
                        fill="none"
                        stroke="currentColor"
                        class="my-1.5 inline-block size-4"
                    >
                        <path
                            d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"
                        />
                        <path d="M9 4v16" />
                        <path d="M14 10l2 2l-2 2" />
                    </svg>
                </label>
                <div class="min-w-0 px-4">
                    <p class="truncate font-semibold">{{ pageTitle }}</p>
                    <p class="truncate text-xs opacity-70">
                        {{ pageDescription }}
                    </p>
                </div>
                <div class="ml-auto flex items-center gap-3 px-2">
                    <div class="hidden items-center gap-2 sm:flex">
                        <span
                            class="grid h-8 w-8 place-items-center rounded-full bg-neutral text-xs font-semibold text-neutral-content"
                        >
                            {{ initials }}
                        </span>
                        <div class="leading-tight">
                            <p class="text-sm font-medium">
                                {{ auth.user?.username || 'User' }}
                            </p>
                            <p class="text-xs capitalize opacity-70">
                                {{ auth.user?.role || 'operator' }}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="btn btn-ghost btn-sm"
                        @click="onLogout"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div class="p-4">
                <RouterView />
            </div>
        </div>

        <div class="drawer-side is-drawer-close:overflow-visible">
            <label
                for="dashboard-drawer"
                aria-label="close sidebar"
                class="drawer-overlay"
            />
            <div
                class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64"
            >
                <ul class="menu w-full grow">
                    <li>
                        <RouterLink
                            :to="{ name: 'dashboard-usage' }"
                            class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                            data-tip="Usage"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                                stroke-width="2"
                                fill="none"
                                stroke="currentColor"
                                class="my-1.5 inline-block size-4"
                            >
                                <path d="M4 6h16" />
                                <path d="M4 12h16" />
                                <path d="M4 18h10" />
                            </svg>
                            <span class="is-drawer-close:hidden">Usage</span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const drawerOpen = ref(false);

const pageTitle = computed(() => route.meta.title || 'Dashboard');
const pageDescription = computed(
    () => route.meta.description || 'Subscriber usage console',
);

const initials = computed(() => {
    const name = auth.user?.username || 'User';
    return name.slice(0, 2).toUpperCase();
});

watch(
    () => route.fullPath,
    () => {
        drawerOpen.value = false;
    },
);

watchEffect(() => {
    document.title = `${pageTitle.value} · Usage Console`;
});

function onLogout() {
    auth.logout();
    router.replace({ name: 'login' });
}
</script>
