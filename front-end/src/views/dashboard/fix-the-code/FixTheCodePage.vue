<template>
    <section class="space-y-4">
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-2">
                <h2 class="card-title text-base">
                    Q4 : Troubleshoot &amp; Explain
                </h2>
                <p class="text-sm opacity-70">
                    This is my answer for the broken
                    <code>getTotalUsageMB</code> function from the technical
                    test PDF.
                </p>
            </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-3">
                <h3 class="font-semibold">1) The original code</h3>
                <p class="text-sm opacity-70">
                    The PDF gave this function. It looks simple, but when I try
                    to use it, the total becomes wrong (
                    <code>NaN</code>
                    ).
                </p>
                <pre
                    class="bg-slate-900 text-slate-100 text-xs md:text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap"
                ><code>{{ brokenCode }}</code></pre>
            </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-3">
                <h3 class="font-semibold">2) What I think went wrong</h3>
                <p class="text-sm opacity-80">
                    After checking how
                    <code>reduce</code>
                    works, I found
                    <strong>two bugs</strong>
                    , not just one.
                </p>

                <div class="space-y-3 text-sm">
                    <div class="rounded-xl border border-slate-200 p-3">
                        <p class="font-medium mb-1">
                            Bug #1 — no return inside reduce
                        </p>
                        <p class="opacity-80">
                            Inside
                            <code>reduce</code>
                            , every loop must give back the next total. In the
                            broken code I only did
                            <code>total += ...</code>
                            , but I never
                            <code>return</code>
                            that value. So the next loop gets
                            <code>undefined</code>
                            , and
                            <code>undefined + number</code>
                            becomes
                            <code>NaN</code>
                            .
                        </p>
                    </div>

                    <div class="rounded-xl border border-slate-200 p-3">
                        <p class="font-medium mb-1">
                            Bug #2 — no starting value (0)
                        </p>
                        <p class="opacity-80">
                            I also forgot to give
                            <code>reduce</code>
                            an initial value. If I don’t pass
                            <code>0</code>
                            , JavaScript uses the first item in the array as the
                            starting total. In this case the first item is an
                            object like
                            <code>{ dataUsageMB: 10 }</code>
                            , not a number. So the sum starts in a weird way and
                            breaks.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-3">
                <h3 class="font-semibold">3) How I fixed it</h3>
                <p class="text-sm opacity-70">
                    My fix is small: return the new total every time, and start
                    from
                    <code>0</code>
                    .
                </p>
                <pre
                    class="bg-slate-900 text-slate-100 text-xs md:text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap"
                ><code>{{ fixedCode }}</code></pre>
            </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-3">
                <h3 class="font-semibold">4) Quick demo</h3>
                <p class="text-sm opacity-70">
                    Sample data:
                    <code>[{ dataUsageMB: 10 }, { dataUsageMB: 5 }]</code>
                    . Expected total is
                    <strong>15</strong>
                    .
                </p>

                <!-- FIXED CODE -->
                <p>Fixed Code</p>

                <pre
                    class="bg-slate-900 text-slate-100 text-xs md:text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap"
                ><code>{{ fixedCode }}</code></pre>
                <button class="btn btn-success btn-sm" @click="runFixed">
                    Run fixed code
                </button>

                <!-- BROKEN CODE -->
                <p>Broken Code</p>
                <pre
                    class="bg-slate-900 text-slate-100 text-xs md:text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap"
                ><code>{{ brokenCode }}</code></pre>

                <button class="btn btn-error btn-sm" @click="runBroken">
                    Run broken code
                </button>

                <div class="flex flex-wrap gap-2"></div>

                <p v-if="demoResult !== null" class="text-sm">
                    Result:

                    <code class="ml-1">{{ String(demoResult) }}</code>
                </p>
            </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-3">
                <h3 class="font-semibold">
                    5) How I will avoid this next time
                </h3>
                <ul class="list-disc list-inside text-sm space-y-2 opacity-90">
                    <li>
                        If I use
                        <code>reduce</code>
                        to count a number, I will always start with
                        <code>0</code>
                        .
                    </li>
                    <li>
                        I will always
                        <code>return</code>
                        the accumulator from the callback.
                    </li>
                    <li>
                        I will test with a tiny example, like
                        <code>10 + 5 === 15</code>
                        , before using it in the real app.
                    </li>
                    <li>
                        If
                        <code>reduce</code>
                        still feels confusing, I can use a normal
                        <code>for...of</code>
                        loop first. It’s clearer for me while learning.
                    </li>
                </ul>

                <pre
                    class="bg-slate-900 text-slate-100 text-xs md:text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap"
                ><code>{{ loopAlternative }}</code></pre>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';

const brokenCode = `function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    total += record.dataUsageMB;
  });
}`;

const fixedCode = `function getTotalUsageMB(records) {
    return records.reduce((total, record) => total + record.dataUsageMB, 0);
}`;

const loopAlternative = `function getTotalUsageMB(records) {
  let total = 0;
  for (const record of records) {
    total += record.dataUsageMB;
  }
  return total;
}`;

const sample = [{ dataUsageMB: 10 }, { dataUsageMB: 5 }];
const demoResult = ref(null);
const demoLabel = ref('');

function getTotalBroken(records) {
    return records.reduce((total, record) => {
        total += record.dataUsageMB;
    });
}

function getTotalFixed(records) {
    return records.reduce((total, record) => total + record.dataUsageMB, 0);
}

function runBroken() {
    demoLabel.value = 'broken';
    demoResult.value = getTotalBroken(sample);
}

function runFixed() {
    demoLabel.value = 'fixed';
    demoResult.value = getTotalFixed(sample);
}
</script>
