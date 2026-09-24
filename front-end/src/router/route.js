import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/auth/LoginPage.vue'),
        meta: { guestOnly: true },
    },
    {
        path: '/',
        name: '/usage',
    },
    {
        path: '/usage',
        name: 'usage',
        component: () => import('../views/usage/UsageListPage.vue'),
        meta: { requiresAuth: true },
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    //if token exists, but object missing validate with /me
    if (auth.token && !auth.user) {
        await auth.restoreSession()
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: 'login' , query: { redirect: to.fullPath } }
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
        return { name: 'usage'}
    }

    return true
})

export default router;
