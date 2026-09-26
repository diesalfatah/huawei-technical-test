<template>
    <section class="space-y-4">
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-2">
                <h2 class="card-title text-base">
                    Q3 : Subscriber &amp; Usage SQL
                </h2>
                <p class="text-sm opacity-70">
                    Static SQL answers with screenshot evidence from DB Browser.
                    This page does not execute SQL. Put your images in
                    <code>front-end/public/q3/</code> using the filenames below.
                </p>
            </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-3">
                <h3 class="font-semibold">How to set up DB for live test</h3>
                <ol
                    class="list-decimal list-inside text-sm space-y-2 opacity-90"
                >
                    <li>
                        Install
                        <a
                            class="link"
                            href="https://sqlitebrowser.org/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            DB Browser for SQLite
                        </a>
                        .
                    </li>
                    <li>
                        Open / create:
                        <code>back-end/sql/huawei-q3.db</code>
                    </li>
                    <li>Run <code>back-end/sql/q3-setup.sql</code> first.</li>
                    <li>
                        Run <code>back-end/sql/q3-answers.sql</code> in order
                        (Q3.1 → Q3.5).
                    </li>
                    <li>
                        Screenshot each result in DB Browser and save files into
                        <code>front-end/public/q3/</code> with the exact names
                        listed on each card.
                    </li>
                </ol>
            </div>
        </div>

        <article
            v-for="item in answers"
            :key="item.id"
            class="card bg-base-100 shadow-sm"
        >
            <div class="card-body gap-3">
                <div class="flex flex-wrap items-start gap-2">
                    <span class="badge badge-primary badge-sm">
                        Q3.{{ item.id }}
                    </span>
                    <h3 class="font-semibold text-sm md:text-base">
                        {{ item.title }}
                    </h3>
                </div>

                <p v-if="item.note" class="text-sm opacity-70">
                    {{ item.note }}
                </p>

                <div>
                    <p class="text-xs font-medium opacity-70 mb-1">
                        SQL answer
                    </p>
                    <pre
                        class="bg-slate-900 text-slate-100 text-xs md:text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap"
                    ><code>{{ item.sql }}</code></pre>
                </div>

                <div>
                    <p class="text-sm font-medium mb-2">
                        Evidence (DB Browser screenshot)
                    </p>
                    <p class="text-xs opacity-60 mb-2">
                        Expected file:
                        <code>public/q3/{{ item.imageFile }}</code>
                    </p>

                    <img
                        v-if="!hiddenImages[item.id]"
                        :src="`/q3/${item.imageFile}`"
                        :alt="`Q3.${item.id} evidence`"
                        class="w-full max-w-3xl rounded-xl border border-slate-200 bg-slate-50"
                        @error="onImageError(item.id)"
                    />

                    <div
                        v-else
                        class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm opacity-70"
                    >
                        Image not found yet. Add
                        <code>front-end/public/q3/{{ item.imageFile }}</code>
                        then refresh.
                    </div>
                </div>
            </div>
        </article>
    </section>
</template>

<script setup>
import { reactive } from 'vue';

const hiddenImages = reactive({});

function onImageError(id) {
    hiddenImages[id] = true;
}

const answers = [
    {
        id: 1,
        title: 'Insert a new subscriber named Fajar (Basic, activated 24 January 2024)',
        note: 'PDF did not give an ID — SUB07 is the next logical ID after SUB06. Screenshot the verification SELECT result.',
        imageFile: 'q3-1-insert-fajar.png',
        sql: `INSERT INTO subscribers (id, name, plan, activation_date)
VALUES ('SUB07', 'Fajar', 'Basic', '2024-01-24');

-- verify:
SELECT id, name, plan, activation_date
FROM subscribers
WHERE id = 'SUB07';`,
    },
    {
        id: 2,
        title: "Update Fajar's plan to Premium",
        note: 'Screenshot the row after UPDATE (plan should be Premium).',
        imageFile: 'q3-2-update-fajar.png',
        sql: `UPDATE subscribers
SET plan = 'Premium'
WHERE id = 'SUB07';

-- verify:
SELECT id, name, plan, activation_date
FROM subscribers
WHERE id = 'SUB07';`,
    },
    {
        id: 3,
        title: 'Total data usage (sum of dataUsageMB) for all Premium-plan subscribers',
        note: 'Run after Q3.1 and Q3.2. Screenshot the SUM result.',
        imageFile: 'q3-3-premium-total.png',
        sql: `SELECT SUM(u.data_usage_mb) AS total_premium_data_mb
FROM usage AS u
JOIN subscribers AS s ON s.id = u.subscriber_id
WHERE s.plan = 'Premium';`,
    },
    {
        id: 4,
        title: 'Top 3 subscribers by total data usage across all snapshots',
        note: 'Screenshot the 3 result rows.',
        imageFile: 'q3-4-top3.png',
        sql: `SELECT
  u.subscriber_id,
  s.name,
  SUM(u.data_usage_mb) AS total_data_mb
FROM usage AS u
JOIN subscribers AS s ON s.id = u.subscriber_id
GROUP BY u.subscriber_id, s.name
ORDER BY total_data_mb DESC
LIMIT 3;`,
    },
    {
        id: 5,
        title: 'Subquery: subscribers whose average call minutes per snapshot is <= 30',
        note: 'Screenshot the matching subscribers (expected: Budi, Nia).',
        imageFile: 'q3-5-avg-call.png',
        sql: `SELECT s.id, s.name
FROM subscribers AS s
WHERE s.id IN (
  SELECT subscriber_id
  FROM usage
  GROUP BY subscriber_id
  HAVING AVG(call_minutes) <= 30
);`,
    },
];
</script>
