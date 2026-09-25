import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// LOGIN AUTH
import LoginPage from '../views/auth/LoginPage.vue';

// LAYOUT
import DashboardLayout from '../views/dashboard/Layout.vue';

// COMPONENTS
import UsagePage from '../views/dashboard/usage/UsagePage.vue';
import CronJobPage from '../views/dashboard/cron-job/CronJobPage.vue';
import DatabaseIntegrationPage from '../views/dashboard/database-integration/DatabaseIntegrationPage.vue';
import FixTheCodePage from '../views/dashboard/fix-the-code/FixTheCodePage.vue';

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginPage,
        meta: { guestOnly: true },
    },
    {
        path: '/dashboard',
        component: DashboardLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: { name: 'dashboard-usage' },
            },
            {
                path: 'usage',
                name: 'dashboard-usage',
                component: UsagePage,
            },
            {
                path: 'cron-job',
                name: 'dashboard-cron-job',
                component: CronJobPage,
            },
            {
                path: 'database-integration',
                name: 'dashboard-database-integration',
                component: DatabaseIntegrationPage,
            },
            {
                path: 'fix-the-code',
                name: 'dashboard-fix-the-code',
                component: FixTheCodePage,
            },
            {
                path: 'cron-job',
                name: 'dashboard-cron-job',
                component: CronJobPage,
                meta: {
                    title: 'Cron Job',
                    description: 'Usage snapshot schedule',
                },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();

    if (auth.token && !auth.user) {
        await auth.restoreSession();
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !auth.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
        return { name: 'dashboard-usage' };
    }

    return true;
});

export default router;
