import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, meApi } from '../api/auth/login'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '')
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const loading = ref(false)
    const error = ref('')

    const isAuthenticated = computed(() => Boolean(token.value))
    const isAdmin = computed(() => user.value?.role === 'admin')

    async function login(username, password) {
        loading.value = true
        error.value = ''
        try {
            const data = await loginApi({ username, password })
            token.value = data.token
            user.value = data.user
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            return true
        } catch (e) {
            error.value = e.response?.data?.message || 'Login failed'
            return false
        } finally {
            loading.value = false
        }
    }

    async function restoreSession() {
        if (!token.value) return false
        try {
            const data = await meApi()
            user.value = data.user
            localStorage.setItem('user', JSON.stringify(data.user))
            return true
        } catch {
            logout()
            return false
        }
    }

    function logout() {
        token.value = ''
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return {
        token,
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        restoreSession,
        logout,
    }
})
