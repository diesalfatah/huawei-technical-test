import { defineStore } from 'pinia';
import { loginApi, meApi } from '../api/auth/login';

export const useTestStore = defineStore('test', {
    state: () => ({
        ardhian: {
            initCount: 0,
            isLoading: true,
            data: [
                {
                    name: 'Ardhian',
                    age: 17,
                },
                {
                    name: 'Dies',
                    age: 12,
                },
                {
                    name: 'Fithroh',
                    age: 3000,
                },
                {
                    name: 'Riyan',
                    age: 20,
                },
                {
                    name: 'Anas',
                    age: 90,
                },
                {
                    name: 'Jendi',
                    age: 32,
                },
            ],
        },

        dies: {
            initCount: 0,
            isLoading: true,
        },
    }),

    getters: {},

    actions: {
        handleCount() {
            this.ardhian.initCount++;
            if (this.ardhian.initCount < 10) {
                this.ardhian.isLoading = true;
            } else {
                this.ardhian.isLoading = false;
            }
        },
        diesCount() {
            this.dies.initCount++;
            if (this.dies.initCount > 10) {
                this.dies.isLoading = true;
            } else {
                this.dies.isLoading = false;
            }
        },
    },
});
