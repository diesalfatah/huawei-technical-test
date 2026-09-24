import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginPage from '../views/auth/LoginPage.vue';
import DashboardLayout from '../views/dashboard/Layout.vue';
import UsagePage from '../views/dashboard/usage/UsagePage.vue';
import TestDies from '../views/auth/TestDies.vue';

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
                meta: {
                    title: 'Usage',
                    description: 'Subscriber call, SMS, and data records',
                },
            },
            {
                path: '/test',
                name: 'test',
                component: TestDies,
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
