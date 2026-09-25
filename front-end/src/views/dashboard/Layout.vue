<template>
    <div class="drawer lg:drawer-open">
        <input
            id="dashboard-drawer"
            v-model="drawerOpen"
            type="checkbox"
            class="drawer-toggle"
        />

        <div class="drawer-content min-h-screen bg-base-200">
            <div class="navbar sticky top-0 z-20 bg-base-100 shadow-sm">
                <div class="flex-none lg:hidden">
                    <label
                        for="dashboard-drawer"
                        aria-label="open sidebar"
                        class="btn btn-square btn-ghost"
                    >
                        <Menu class="size-5" />
                    </label>
                </div>

                <div class="min-w-0 flex-1 px-2">
                    <p class="truncate font-semibold">{{ pageTitle }}</p>
                    <p class="truncate text-xs opacity-60">
                        {{ pageDescription }}
                    </p>
                </div>

                <div class="flex-none items-center gap-3 px-1 sm:flex">
                    <div class="hidden items-center gap-2 sm:flex">
                        <div class="avatar avatar-placeholder">
                            <div
                                class="w-9 rounded-full bg-primary text-primary-content"
                            >
                                <span class="text-xs">{{ initials }}</span>
                            </div>
                        </div>
                        <div class="leading-tight">
                            <p class="text-sm font-medium">
                                {{ auth.user?.username || 'User' }}
                            </p>
                            <span class="badge badge-ghost badge-sm capitalize">
                                {{ auth.user?.role || 'operator' }}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="btn btn-outline btn-sm"
                        @click="onLogout"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <main class="p-4 md:p-6">
                <RouterView />
            </main>
        </div>

        <div class="drawer-side">
            <label
                for="dashboard-drawer"
                aria-label="close sidebar"
                class="drawer-overlay"
            />

            <aside class="flex min-h-full w-64 flex-col bg-base-100">
                <div class="h-20 overflow-hidden bg-base-200">
                    <img
                        src="../../assets/huawei-logo.png"
                        alt="Huawei Logo"
                        class="h-full w-full object-cover object-center"
                    />
                </div>

                <ul class="menu w-full grow p-2">
                    <li class="menu-title">Menu</li>
                    <li v-for="item in sidebarMenu" :key="item.name">
                        <RouterLink
                            :to="{ name: item.link }"
                            active-class="bg-primary"
                        >
                            <component :is="item.icon" class="size-4" />
                            {{ item.name }}
                        </RouterLink>
                    </li>
                </ul>

                <div class="border-t border-base-300 p-4 text-xs opacity-60">
                    Usage Console
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup>
import { ChartPie, CodeXml, Database, EyeIcon, Menu, Timer } from '@lucide/vue';
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

const sidebarMenu = [
    { name: 'Q1 : Usage', link: 'dashboard-usage', icon: ChartPie },
    { name: 'Q2 : Cron Job', link: 'dashboard-cron-job', icon: Timer },
    {
        name: 'Q3 : Database Integration',
        link: 'dashboard-database-integration',
        icon: Database,
    },
    {
        name: 'Q4 : Fix the Code',
        link: 'dashboard-fix-the-code',
        icon: CodeXml,
    },
];

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
