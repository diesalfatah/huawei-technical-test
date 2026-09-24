<template>
    <div class="flex flex-col gap-4">
        <div class="flex gap-2">
            <button class="btn btn-primary" @click="store.handleCount()">
                Count
            </button>
        </div>

        <p v-if="store.ardhian.isLoading == true">Loading ....</p>
        <p v-else>COUNT STORE {{ store.ardhian.initCount }}</p>

        <div class="flex gap-2">
            <button class="btn btn-primary" @click="store.diesCount()">
                Dies Count
            </button>
            <p v-if="store.dies.isLoading == true">Loading ....</p>
            <p v-else>COUNT STORE {{ store.dies.initCount }}</p>
        </div>
    </div>

    <div
        class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100"
    >
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in store.ardhian.data" :key="item.name">
                    <td>{{ item.name }}</td>
                    <td>{{ item.age }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <a
        class="btn btn-primary"
        v-for="tai in sidebarMenu"
        :key="tai.name"
        :href="tai.link"
    >
        {{ tai.name }}
    </a>

    <Button title="Click me" color="primary" />
    <Button title="awokaowk" color="secondary" />
    <Button title="hehe" color="accent" />
    <Button title="pantek" color="info" />
    <Button title="Click me" color="success" />
    <Button title="Click me" color="warning" />
    <Button title="Click me" color="error" />
</template>

<script setup>
import Button from '../../components/button/Button.vue';
import { useTestStore } from '../../stores/test';

const store = useTestStore();

let localCount = 0;

const sidebarMenu = [
    { name: 'Menu A', link: '/aowkaowk' },
    { name: 'Menu B', link: '/hehe' },
    { name: 'Menu C', link: '/wkwkwk' },
];

function handleLocalCount() {
    localCount++;
}
</script>
