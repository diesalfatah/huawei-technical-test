<template>
    <button class="btn btn-primary rounded-xl" @click="showalert()">
        OPTION API
    </button>
    <button class="btn btn-secondary rounded-xl" @click="showAnotherAlert()">
        Composition API
    </button>

    <!-- INI CONTOH PAKE TAILWIND. GW GAUSAH NULIS STYLE -->
    <div class="flex flex-col gap-5">
        <!-- CONTOH NOMER 1 PAKE PURE CSS -->
        <!-- NANTI CARI TAU BEDANYA PADDING sama MARGIN -->
        <p>INI CONTOH 1 PAKE PURE CSS</p>
        <main class="main-example-1">
            <div class="main-example-1-left-container">
                <div class="section-a">
                    <p>A</p>
                </div>
                <div class="main-example-1-row-container">
                    <div class="section-c">
                        <p>D</p>
                    </div>
                    <div class="section-d">
                        <p>D</p>
                    </div>
                </div>
            </div>
            <div class="main-example-1-right-container">
                <p>B</p>
            </div>
        </main>

        <p>INI CONTOH 1 PAKE TAILWIND</p>
        <main class="flex flex-row gap-2 bg-blue-500 p-4">
            <div class="flex flex-col gap-2 w-[80%]">
                <div class="bg-red-500">
                    <p class="text-white">A</p>
                </div>
                <!-- FLEX DIRECTION BY DEFAULT DIA AKAN ROW -->
                <div class="flex gap-2">
                    <div class="bg-yellow-500 w-full">
                        <p class="text-black">C</p>
                    </div>
                    <div class="bg-purple-500 w-full">
                        <p class="text-white">D</p>
                    </div>
                </div>
            </div>
            <div class="flex flex-col w-[20%] bg-yellow-500">
                <p class="text-white">B</p>
            </div>
        </main>
    </div>
</template>

<!-- INI CONTOH OPTION API VUE JS -->
<script>
export default {
    name: 'AuthPage',
    data() {
        return {
            // BUAT DEFINE VARIABLE
            a: '1',
        };
    },
    methods: {
        showalert() {
            alert('Hello World');
        },
    },
    // mounted: {
    // RUNNING FUNCTION PAS PAGE DIBUKA DENGAN CARA PANGGIL FUNCTION
    // },
    // watch: {
    // BUAT WATCHING VARIABLE, KALO VARIABLE TERSEBUT BERUBAH MAKA FUNCTION INI AKAN DIJALANKAN
    // },
};
</script>

<!-- COMPOSITION API. WHAT YOU WRITE, WHAT YOU GOT -->
<script setup>
import { onMounted } from 'vue';

// KALO MO DEFINE DATA DI SINI TINGGAL DEFINE AJA
let a = '1';

const showAnotherAlert = () => {
    alert('Hello World from Composition API');
};

// const loadAlert = () => {
//     alert('PAGE LOADed');
// };

// onMounted(() => {
//     loadAlert();
// });
</script>

<!-- Style scooped biar style nya cuman ke apply di file ini aja -->
<!-- KALO GA PAKE SCOOPED, bakal ke apply global -->
<style scooped>
.main-example-1 {
    display: flex;
    flex-direction: row;
    background-color: blue;
    padding: 20px 20px 20px 20px;
}

.main-example-1-row-container {
    display: flex;
    flex-direction: row;
    gap: 12px;
}

.main-example-1-left-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: green;
    color: white;
    /* ini kalo mo set padding 1 1 , kalo lu mau 1 value doang dia bakal ke apply buat kanan kiri atas bawah */
    padding: 10px 10px 10px 10px;
    width: 80%;
}
.main-example-1-right-container {
    display: flex;
    flex-direction: column;
    background-color: orange;
    width: 20%;
    padding: 20px;
}

.section-a {
    background-color: red;
    color: white;
}
.section-c {
    background-color: yellow;
    color: black;
    width: 100%;
}

.section-d {
    background-color: purple;
    color: white;
    width: 100%;
}
</style>
