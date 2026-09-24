import { defineStore } from 'pinia'
import { loginApi, meApi } from '../api/auth/login'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        loading: false,
        error: '',
    }),

    getters: {
        isAuthenticated: (state) => Boolean(state.token),
        isAdmin: (state) => state.user?.role === 'admin',
    },

    actions: {
        async login(username, password) {
            this.loading = true
            this.error = ''
            try {
                const data = await loginApi({ username, password })
                this.token = data.token
                this.user = data.user
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                return true
            } catch (e) {
                this.error = e.response?.data?.message || 'Login failed'
                return false
            } finally {
                this.loading = false
            }
        },

        async restoreSession() {
            if (!this.token) return false
            try {
                const data = await meApi()
                this.user = data.user
                localStorage.setItem('user', JSON.stringify(data.user))
                return true
            } catch {
                this.logout()
                return false
            }
        },

        logout() {
            this.token = ''
            this.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
    },
})
