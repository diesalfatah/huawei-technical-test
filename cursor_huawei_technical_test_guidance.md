# Huawei technical test guidance
_Exported on 9/25/2026 at 14:39:37 GMT+7 from Cursor (3.21.18)_

---

**User**

Im a beginner software engineer. i got huawei technical test to apply the job. i already create back-end using express.js and front end using vue js3 + tailwind to match huawei's development tech stack.

Based on Technical-test.pdf, i already create back-end and front-end for question 1.@back-end @front-end . Tell me step by step how to implement all of technical test question inside @back-end @front-end . Give me the step by step, i want to learn it. don't generate the code inside the file. give me the code and its explanation why use that code, and why you use that flow on this chat.  

---

**Cursor**

I'll review the technical test PDF and your existing back-end/front-end so I can map a learning-oriented step-by-step plan for every question.

I'll dig into your existing Q1 code and keep looking for the technical test PDF so the guide matches the real requirements.

The PDF isn’t in the repo. I’ll check your zip and past chat context, and search for the PDF if you approve.

I found the PDF requirements. Mapping them to your current code, then writing a full learning guide with example code in chat only (no file edits).

# Huawei Technical Test — Learning Guide

The PDF has **4 questions**. Only Q1–Q2 need Express/Vue. Q3 is SQL. Q4 is a short bug explanation. Frontend is **optional bonus**, not required.

---

## Big picture (why this flow)

| Question | What they test | Where it lives |
|---|---|---|
| **Q1** | Can you design a REST API? | `back-end` (+ optional `front-end`) |
| **Q2** | Can you automate + manage files? | cron job + cleanup script in `back-end` |
| **Q3** | Can you write SQL? | SQL file / README answers (no Express needed) |
| **Q4** | Can you debug JS carefully? | written answer in README |

Recommended order: finish Q1 docs → Q2 → Q3 → Q4 → README.

---

## What you already have (Q1 status)

Your backend already covers Q1 well:

- `POST /api/usage` — create
- `GET /api/usage` — list all / filter by `?subscriberId=`
- `PATCH /api/usage/:id` — update (bonus)
- `DELETE /api/usage/:id` — delete (bonus)
- In-memory store + seed data

**PDF only asks: record + retrieve.** Update/delete are extra (good).

Gaps to close for a strong submission:

1. Empty `README.md` (required)
2. Optional frontend not wired to API yet (`getListUsage.js` empty)
3. `node-cron` installed but jobs empty → needed for **Q2**
4. Packages like `bcryptjs` / `jsonwebtoken` are **not required** by this PDF — ignore them for now

---

# Q1 — Subscriber Usage API

## Goal
Store usage records and return them via HTTP. Storage = array in memory (you already did this).

## Why this architecture

```
Route  →  Controller  →  Store (array)
```

- **Route**: URL + HTTP method
- **Controller**: validate input, pick status code, return JSON
- **Store**: hold data (no database)

This matches how real APIs are structured, even without a DB.

## Your endpoints (document these in README)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/usage` | Create record |
| `GET` | `/api/usage` | Get all |
| `GET` | `/api/usage?subscriberId=SUB01` | Filter |
| `PATCH` | `/api/usage/:id` | Update (bonus) |
| `DELETE` | `/api/usage/:id` | Delete (bonus) |

### Example request/response (put this in README)

**Create**
```http
POST /api/usage
Content-Type: application/json

{
  "subscriberId": "SUB01",
  "callMinutes": 40,
  "smsCount": 10,
  "dataUsageMB": 1500
}
```

**Response `201`**
```json
{
  "id": 4,
  "subscriberId": "SUB01",
  "callMinutes": 40,
  "smsCount": 10,
  "dataUsageMB": 1500,
  "timestamp": "2026-09-23T15:00:00.000Z"
}
```

### Why `timestamp` and `id`?
- `id` = unique key for update/delete
- `timestamp` = when the record was created (Q2/Q3 use time-related data)

You already implement this in `usageStore.js` — good.

---

## Q1 optional frontend (bonus) — learning steps

### Why Vite proxy?
Frontend runs on e.g. `5173`, backend on `3000`. Browser blocks cross-origin calls unless you proxy.

You already have this in `vite.config.js`:
```js
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
}
```

Frontend calls `/api/usage` → Vite forwards to `http://localhost:3000/api/usage`.

### Step 1 — shared Axios client (`src/api/http.js`)
You already have:
```js
import axios from 'axios'

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})
```

**Why Axios + `baseURL`?** One place to change API prefix; every call becomes `http.get('/usage')`.

### Step 2 — API function (`src/api/usage/getListUsage.js`)
```js
import { http } from '../http'

export async function getListUsage(subscriberId) {
  const params = subscriberId ? { subscriberId } : undefined
  const { data } = await http.get('/usage', { params })
  return data
}

export async function createUsage(payload) {
  const { data } = await http.post('/usage', payload)
  return data
}
```

**Why separate API files?** UI components stay clean; API logic is reusable/testable.

### Step 3 — Usage page (Composition API)
```vue
<template>
  <main class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">Subscriber Usage</h1>

    <button class="btn btn-primary" @click="loadData" :disabled="loading">
      {{ loading ? 'Loading...' : 'Refresh' }}
    </button>

    <p v-if="error" class="text-red-600">{{ error }}</p>

    <table class="table w-full" v-if="records.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Subscriber</th>
          <th>Call</th>
          <th>SMS</th>
          <th>Data MB</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in records" :key="row.id">
          <td>{{ row.id }}</td>
          <td>{{ row.subscriberId }}</td>
          <td>{{ row.callMinutes }}</td>
          <td>{{ row.smsCount }}</td>
          <td>{{ row.dataUsageMB }}</td>
          <td>{{ row.timestamp }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getListUsage } from '../../api/usage/getListUsage'

const records = ref([])
const loading = ref(false)
const error = ref('')

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    records.value = await getListUsage()
  } catch (e) {
    error.value = e.message || 'Failed to load usage'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
```

**Why this flow?**
1. `ref` = reactive state
2. `onMounted` = fetch when page opens
3. `try/catch/finally` = handle loading + errors cleanly

Add route in `route.js`:
```js
{
  path: '/usage',
  name: 'usage',
  component: () => import('../views/usage/UsagePage.vue'),
}
```

---

# Q2 — Usage Snapshot Automation

## Goal
1. Cron calls `GET /api/usage` at **08:00, 12:00, 15:00 WIB**
2. Save response as CSV
3. Separate script deletes CSVs older than 30 days

## Why call your own HTTP endpoint?
PDF says: *“calls your own retrieval endpoint”*.  
So don’t read the array directly — use HTTP (`fetch` / `axios`). That proves the API works and the job is an external consumer.

## Why WIB timezone?
Indonesia = `Asia/Jakarta` (UTC+7). Cron must use that timezone, not server default UTC.

## Suggested folder structure
```
back-end/
  src/
    jobs/
      snapshotUsage.job.js   ← cron that saves CSV
    scripts/
      cleanupSnapshots.js    ← delete old CSVs
  snapshots/                 ← generated CSV files (gitignore this)
```

## Step 1 — helper: JSON → CSV
```js
// src/jobs/snapshotUsage.job.js (part 1)
const fs = require('fs');
const path = require('path');

function toCsv(records) {
  const headers = ['id', 'subscriberId', 'callMinutes', 'smsCount', 'dataUsageMB', 'timestamp'];
  const lines = [headers.join(',')];

  for (const row of records) {
    lines.push(
      [row.id, row.subscriberId, row.callMinutes, row.smsCount, row.dataUsageMB, row.timestamp]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    );
  }

  return lines.join('\n');
}
```

**Why quote fields?** CSV can break if values contain commas. Quoting is safer.

## Step 2 — fetch API + write file
```js
const axios = require('axios'); // or use native fetch in Node 18+

const SNAPSHOT_DIR = path.join(__dirname, '../../snapshots');
const API_URL = process.env.SNAPSHOT_API_URL || 'http://localhost:3000/api/usage';

async function saveUsageSnapshot() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }

  const { data } = await axios.get(API_URL);

  // Naming convention: usage-YYYYMMDD-HHmmss-WIB.csv
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  );
  const pad = (n) => String(n).padStart(2, '0');
  const fileName =
    `usage-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-WIB.csv`;

  const filePath = path.join(SNAPSHOT_DIR, fileName);
  fs.writeFileSync(filePath, toCsv(data), 'utf8');

  console.log(`Snapshot saved: ${fileName}`);
}

module.exports = { saveUsageSnapshot };
```

**Why this naming?**
- Sortable by date
- Includes time so 3 files/day don’t overwrite each other
- `-WIB` documents timezone in the filename

Document in README:
> Naming: `usage-YYYYMMDD-HHmmss-WIB.csv`  
> Example: `usage-20260923-080000-WIB.csv`

## Step 3 — register cron (`src/jobs/index.js`)
```js
const cron = require('node-cron');
const { saveUsageSnapshot } = require('./snapshotUsage.job');

function startJobs() {
  // second minute hour day month weekday
  // 08:00, 12:00, 15:00 Asia/Jakarta
  cron.schedule(
    '0 8,12,15 * * *',
    () => {
      saveUsageSnapshot().catch((err) => {
        console.error('Snapshot job failed:', err.message);
      });
    },
    { timezone: 'Asia/Jakarta' }
  );

  console.log('Snapshot cron registered (08:00, 12:00, 15:00 WIB)');
}

module.exports = { startJobs };
```

**Why `0 8,12,15 * * *`?**  
At minute 0 of hours 8, 12, and 15, every day.

## Step 4 — start jobs from server
In `server.js`:
```js
require('dotenv').config();
const app = require('./app');
const { startJobs } = require('./jobs');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startJobs();
});
```

**Why start after listen?** Server must be up so the job can call `http://localhost:3000/api/usage`.

### How to test without waiting until 08:00
Temporarily call once:
```js
saveUsageSnapshot();
```
Or run node REPL / a small `npm run snapshot` script that only calls `saveUsageSnapshot()`.

---

## Q2 — Cleanup script (separate)

PDF wants a **separate script**, not the same cron file.

```js
// src/scripts/cleanupSnapshots.js
const fs = require('fs');
const path = require('path');

const SNAPSHOT_DIR = path.join(__dirname, '../../snapshots');
const MAX_AGE_DAYS = 30;
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

function cleanup() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    console.log('No snapshots folder yet.');
    return;
  }

  const now = Date.now();
  const files = fs.readdirSync(SNAPSHOT_DIR).filter((f) => f.endsWith('.csv'));

  let deleted = 0;
  for (const file of files) {
    const fullPath = path.join(SNAPSHOT_DIR, file);
    const age = now - fs.statSync(fullPath).mtimeMs;

    if (age > MAX_AGE_MS) {
      fs.unlinkSync(fullPath);
      deleted += 1;
      console.log(`Deleted: ${file}`);
    }
  }

  console.log(`Cleanup done. Deleted ${deleted} file(s).`);
}

cleanup();
```

Add to `package.json`:
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "cleanup:snapshots": "node src/scripts/cleanupSnapshots.js"
}
```

**Why file `mtime`?** Simple age check based on last modified time. Good enough for this test.

**Why separate script?** Ops often run cleanup via different schedule/manual command, independent from snapshot creation.

Also add to `.gitignore`:
```
snapshots/
```

---

# Q3 — Subscriber & Usage SQL

This is **not** Express code. Put answers in `sql/q3-answers.sql` or in README.

Assume tables:

```sql
-- subscribers
CREATE TABLE subscribers (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50),
  plan VARCHAR(20),
  activation_date DATE
);

-- usage (loaded from Q2 CSVs)
CREATE TABLE usage (
  subscriber_id VARCHAR(10),
  call_minutes INT,
  sms_count INT,
  data_usage_mb INT,
  timestamp DATETIME
);
```

## 1) Insert Fajar
```sql
INSERT INTO subscribers (id, name, plan, activation_date)
VALUES ('SUB07', 'Fajar', 'Basic', '2024-01-24');
```
**Why `SUB07`?** PDF didn’t give an ID; pick the next logical ID and document it. Date format: use ISO `YYYY-MM-DD`.

## 2) Update Fajar to Premium
```sql
UPDATE subscribers
SET plan = 'Premium'
WHERE name = 'Fajar';
-- or safer: WHERE id = 'SUB07';
```
**Why `WHERE`?** Without it, every row would become Premium.

## 3) Total data usage for Premium subscribers
```sql
SELECT SUM(u.data_usage_mb) AS total_premium_data_mb
FROM usage u
JOIN subscribers s ON s.id = u.subscriber_id
WHERE s.plan = 'Premium';
```
**Why JOIN?** Usage has `subscriber_id`; plan lives in `subscribers`. Join connects them.

## 4) Top 3 by total data usage
```sql
SELECT
  u.subscriber_id,
  s.name,
  SUM(u.data_usage_mb) AS total_data_mb
FROM usage u
JOIN subscribers s ON s.id = u.subscriber_id
GROUP BY u.subscriber_id, s.name
ORDER BY total_data_mb DESC
LIMIT 3;
```
**Why `GROUP BY`?** Many snapshot rows per subscriber → sum first, then sort.

## 5) Subquery: avg call minutes ≤ 30
```sql
SELECT subscriber_id
FROM usage
GROUP BY subscriber_id
HAVING AVG(call_minutes) <= 30;
```

Or with names via subquery:
```sql
SELECT s.id, s.name
FROM subscribers s
WHERE s.id IN (
  SELECT subscriber_id
  FROM usage
  GROUP BY subscriber_id
  HAVING AVG(call_minutes) <= 30
);
```
**Why `HAVING` not `WHERE`?** `WHERE` filters rows before aggregation; `HAVING` filters after `AVG()`.

---

# Q4 — Troubleshoot & Explain

Broken code from PDF:
```js
function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    total += record.dataUsageMB;
  });
}
```

## Root cause (2 bugs)

### Bug A — missing `return` inside callback
`reduce` needs the callback to **return** the next accumulator.

Your code does `total += ...` but returns `undefined`. Next iteration: `undefined += number` → `NaN`.

### Bug B — no initial value
```js
array.reduce(callback) // no initial value
```
Without initial value, first element becomes accumulator. Here first element is an **object**, then `object += number` becomes weird string/`NaN` behavior.

Even if you only fix `return`, you should still pass `0` as initial value for summing numbers.

## Fixed code
```js
function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    return total + record.dataUsageMB;
  }, 0);
}
```

Or shorter:
```js
function getTotalUsageMB(records) {
  return records.reduce((total, record) => total + record.dataUsageMB, 0);
}
```

## How to prevent this class of bug
1. Always pass an **initial value** for `reduce` when summing (`0`, `[]`, `{}`)
2. Always **return** the accumulator from the callback
3. Write a tiny unit test:
```js
console.assert(getTotalUsageMB([{ dataUsageMB: 10 }, { dataUsageMB: 5 }]) === 15);
```
4. Prefer readable alternatives when learning:
```js
let total = 0;
for (const record of records) total += record.dataUsageMB;
```

Put this explanation in README under “Q4”.

---

# Submission checklist (General Instructions)

1. Push everything to a Git repo
2. Write `README.md` with:
   - how to install/run backend
   - API endpoint docs (Q1)
   - cron schedule + CSV naming (Q2)
   - how to run cleanup script
   - Q3 SQL answers
   - Q4 bug explanation
3. Optional: PowerPoint/Word also fine, but Markdown README is enough

### Example README skeleton
```md
# Huawei Technical Test

## Setup
### Backend
cd back-end
npm install
npm run dev

### Frontend (optional)
cd front-end
npm install
npm run dev

## Q1 API
- POST /api/usage
- GET /api/usage
- GET /api/usage?subscriberId=SUB01

## Q2 Automation
- Cron: 08:00, 12:00, 15:00 Asia/Jakarta
- File name: usage-YYYYMMDD-HHmmss-WIB.csv
- Cleanup: npm run cleanup:snapshots

## Q3 SQL
(paste queries)

## Q4 Bug
(paste explanation)
```

---

# Suggested learning order (do this)

1. **Today:** Document Q1 endpoints in README + test with Postman/Thunder Client  
2. **Next:** Implement Q2 snapshot job + test by calling `saveUsageSnapshot()` manually  
3. **Then:** Cleanup script + gitignore `snapshots/`  
4. **Then:** Write Q3 SQL in a file / README  
5. **Then:** Write Q4 explanation  
6. **Bonus:** Wire Vue usage page to `GET /api/usage`

---

## Important note for beginners

You don’t need JWT/auth/bcrypt/Zod for this PDF. Focus on:

**CRUD API → cron CSV → SQL → reduce bug → README**

If you want, next message we can do **only Q2** in deep detail (you paste your attempt, I review line-by-line without writing into your files).

---

**User**

yes, thats only the backend side. generate all the code and its explanation about what should i do both in back-end and front end (to integrate backend) so user can test the api based on user interface. also i need to create full flow on the front end and backend where user should use login auth to start the app then operate it. create a golden ways to implement best user flow that match with backend api for front end side. put it all (back-end and front-end code) inside .md inside /huawei-technical-test/docs. make sure this directory never push to git

---

**Cursor**

I'll create a full backend + frontend auth/API guide as Markdown under `docs/`, and add `docs/` to `.gitignore` so it never gets pushed.

Writing the full golden-flow guide into `docs/` now.

Done. Auth + full UI flow guide is ready, and `docs/` is blocked from Git.

### Created
- `docs/GOLDEN-APP-FLOW.md` — full backend + frontend code with explanations
- `docs/README.md` — short index

### Git protection
Root `.gitignore` now includes:

```gitignore
docs/
```

Verified: `git check-ignore` marks both docs files as ignored. They will not be pushed.

### What’s inside the guide
Golden flow: **Login → JWT → Usage CRUD UI**, including:

- Backend: user seed, login, `/me`, JWT middleware, role-based delete
- Frontend: Pinia auth store, router guards, Axios interceptors, Login page, Usage table/form/page
- How to run/test + checklist + common mistakes

Open: `docs/GOLDEN-APP-FLOW.md` and implement step by step from the checklist at the bottom.

Demo accounts in the guide: `admin/admin123`, `operator/op123456`.

---

**User**

is that already contain all from question 1 - 4 ? also tell me how to set up db for q3. update @docs/GOLDEN-APP-FLOW.md 

---

**Cursor**

I'll check what's already in the guide against Q1–Q4, then add the missing parts — especially Q3 database setup.

Updating the guide: it currently covers Q1 + auth/UI well, only sketches Q2, and is missing Q3/Q4. Adding full Q2–Q4 plus DB setup.

**Short answer:** Before this update — **no**. It was mostly Q1 + auth/UI. Q2 was thin; Q3 and Q4 were missing. **Now yes — Q1–Q4 are all in** `docs/GOLDEN-APP-FLOW.md`.

### Coverage now

| Question | Status in the doc |
|---|---|
| **Q1** Usage API + optional Vue UI/auth | Sections 1–3, 5–6 |
| **Q2** Cron CSV + 30-day cleanup | Section 4 (full code) |
| **Q3** SQL + **DB setup** | Section 10 |
| **Q4** `reduce` bug fix + explanation | Section 11 |

### Q3 DB setup (golden path)

You do **not** need to connect Express to a DB for the PDF. Practice SQL locally:

1. Install **DB Browser for SQLite** (easiest on Windows)
2. Create `back-end/sql/huawei-q3.db`
3. Run the setup script in the doc (`subscribers` + `usage` + PDF sample rows)
4. Run the 5 answer queries from Section 10.4

MySQL is also documented as an optional alternative.

Open the top of `docs/GOLDEN-APP-FLOW.md` for the coverage table, then jump to **Section 10** for DB setup.

---

**User**

@.env (1-3)  what does this do? 

---

**Cursor**

Those three lines are **environment variables** your backend reads at startup (via `dotenv`). They configure the server without hard-coding secrets in source code.

| Variable | What it does |
|---|---|
| `PORT=3000` | Port Express listens on. App runs at `http://localhost:3000`. If missing, your code usually falls back to `3000` anyway. |
| `JWT_SECRET=...` | Secret key used to **sign and verify** login tokens. Anyone with this string can forge tokens, so keep it private and never commit it. |
| `JWT_EXPIRES_IN=8h` | How long a login token stays valid (here, 8 hours). After that, the user must log in again. |

### Why use `.env`?
- Different values per machine (your PC vs a server) without changing code
- Secrets stay out of Git (your root `.gitignore` already ignores `.env`)

### What you should change
Replace `replace-this-with-a-long-random-string` with a real random secret, e.g. a long random password-like string. For a local test it can be anything long; for real apps it should be strong and unique.

---

**User**

Help me generate the token for JWT_SECRET

---

**Cursor**

I'll generate a strong random secret you can paste into `JWT_SECRET`.

Use this as your `JWT_SECRET`:

```env
JWT_SECRET=4f53139f030532aabc84767623f006a39f6824abed00d9682671367ffaf498d64085c85dafe48f1489f4e8bdfb5e0fc3995890a72056e8074886d85da1e234fd
```

Your full `.env` can look like:

```env
PORT=3000
JWT_SECRET=4f53139f030532aabc84767623f006a39f6824abed00d9682671367ffaf498d64085c85dafe48f1489f4e8bdfb5e0fc3995890a72056e8074886d85da1e234fd
JWT_EXPIRES_IN=8h
```

It was generated with Node’s `crypto.randomBytes(64)` (128 hex chars). Keep `.env` out of Git — yours is already gitignored.

To make a new one later:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

**User**

@env.js (1-13) explain this line of code please. make sure to always explain me these codes like im a total beginner

---

**Cursor**

Think of this file as a **settings reader**.  
Your `.env` file stores values like `PORT=3000`.  
This `env.js` file **reads those values** and gives them to the rest of your backend in a clean way.

---

### Line 1
```js
require('dotenv').config();
```

- `require('dotenv')` = load the `dotenv` package
- `.config()` = read the `.env` file and put its values into `process.env`

After this runs, Node can access:
- `process.env.PORT`
- `process.env.JWT_SECRET`
- `process.env.JWT_EXPIRES_IN`

Without this line, your `.env` values are basically invisible to the app.

---

### Lines 3–7
```js
const env = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
};
```

This creates one object named `env` that holds all settings.

#### `port: Number(process.env.PORT) || 3000`
1. Read `PORT` from `.env` (text like `"3000"`)
2. `Number(...)` converts text → real number (`3000`)
3. `|| 3000` means: if it’s missing/invalid, use `3000`

So:
- `.env` has `PORT=3000` → use `3000`
- `.env` has no `PORT` → still use `3000`

#### `jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me'`
- Prefer the secret from `.env`
- If missing, fall back to a temporary default string

That fallback is only for local practice. In real apps, missing secret should be treated as a serious problem.

#### `jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h'`
- Prefer `.env` value (example: `8h`)
- If missing, default to 8 hours

`8h` means login tokens expire after 8 hours.

---

### Lines 9–11
```js
if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is missing');
}
```

- `!process.env.JWT_SECRET` = “JWT_SECRET is empty/missing”
- If true, print a warning in the terminal

This does **not** stop the app. It just reminds you: “Hey, set a real secret.”

---

### Line 13
```js
module.exports = env;
```

This makes `env` available to other files.

Example in another file:
```js
const env = require('./config/env');
console.log(env.port);        // 3000
console.log(env.jwtSecret);   // your secret
```

---

### Tiny mental model

```text
.env file  →  dotenv loads it  →  process.env  →  env.js packages it  →  other files use env.port / env.jwtSecret
```

If you want, next we can walk through how `auth.controller.js` uses `env.jwtSecret` when creating a login token — still beginner style.

---

**User**

@back-end remove unused folder/file inside back-end. keep folder and files that will be used based on the documentation @docs/GOLDEN-APP-FLOW.md 

---

**Cursor**

I'll compare your current `back-end` layout to the golden-flow docs and remove only unused files/folders.

Checking which of those extra files are empty stubs vs referenced, so we only delete what's truly unused.

Cleanup done. `back-end` now matches the golden-flow structure.

### Removed (not used by the docs)
| Removed | Why |
|---|---|
| `back-end.zip` | Unused archive |
| `src/config/db.js` | Express stays in-memory; Q3 SQL is separate |
| `src/db/` | Docs use `back-end/sql/` instead |
| `src/repositories/` | Extra layer not in the guide |
| `src/services/` | Extra layer not in the guide |
| `src/utils/` | Not referenced |
| `src/validators/` | Not referenced |
| `src/middlewares/auth.js` | Duplicate of `auth.middleware.js` |
| `src/middlewares/validate.js` | Not in the guide |
| `src/routes/index.js` | Not wired in `app.js` |
| `src/jobs/usageSnapshot.job.js` | Renamed to match docs |

### Kept / prepared (per docs)
```text
back-end/
  .env, .env.example, package.json, ...
  snapshots/          ← Q2 CSV output
  sql/                ← Q3 practice SQL
  src/
    app.js, server.js
    config/env.js
    data/ + seeder/
    controllers/auth-controller/
    controllers/usage-controller/
    middlewares/ (auth.middleware, errorHandler, notFound)
    routes/ (auth.routes, usage.routes)
    jobs/ (index.js, snapshotUsage.job.js)
    scripts/ (cleanupSnapshots.js, runSnapshotOnce.js)
```

Empty stubs left for you to fill next: auth files, user seed/store, snapshot scripts.

---

**User**

@back-end/src/data/seeder/userSeed.js explain me this line of code

---

**Cursor**

This file creates **starter login users** when the backend starts. Think of it as “fake employee accounts” for testing.

---

### Line 1
```js
const bcrypt = require('bcryptjs');
```

Loads the `bcryptjs` package.

**Why?** We must **not** store passwords as plain text like `"admin123"`.  
`bcrypt` turns a password into a scrambled string (a **hash**).

Example idea:
- password: `admin123`
- hash: something long like `$2a$10$xK9...` (not readable)

---

### Lines 3–19
```js
function createUserSeed() {
  return [ ... ];
}
```

This is a function named `createUserSeed`.  
When other files call it, it **returns an array of 2 users**.

---

### Lines 5–11 (first user)
```js
{
  id: 1,
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10),
  role: 'admin',
}
```

One user object:

| Field | Meaning |
|---|---|
| `id: 1` | Unique number for this user |
| `username: 'admin'` | Login name |
| `passwordHash: ...` | Scrambled password (not the real password text) |
| `role: 'admin'` | Permission level (can delete later) |

#### This important line:
```js
passwordHash: bcrypt.hashSync('admin123', 10),
```

- `'admin123'` = the real password (only used here to create the hash)
- `10` = how “strong/slow” the hashing is (cost factor). Higher = safer but slower
- `hashSync` = do hashing **now**, wait until finished, then return the hash

So the app stores `passwordHash`, not `"admin123"`.

Later at login:
1. User types password
2. App compares typed password with stored hash using bcrypt
3. If match → login success

---

### Lines 12–17 (second user)
Same idea for operator:

- username: `operator`
- password: `operator123` (hashed)
- role: `operator` (usually less power than admin)

> Note: in the golden doc the operator password was `op123456`. Yours is `operator123`. That’s fine — just remember which one you set when testing login.

---

### Line 21
```js
module.exports = { createUserSeed };
```

Exports the function so other files can use it, like:

```js
const { createUserSeed } = require('./seeder/userSeed');
const users = createUserSeed();
```

---

### Tiny mental model

```text
userSeed.js
   creates starter users
   with hashed passwords
        ↓
userStore.js (next file)
   keeps those users in memory
        ↓
login API
   checks username + password
```

If you want, next we can explain `userStore.js` the same beginner way.

---

**User**

yes explain it to me

---

**Cursor**

`userStore.js` is your **in-memory user database**.  
It keeps the seeded users in a list and gives other files safe ways to find them.

---

### Line 1
```js
const { createUserSeed } = require('./seeder/userSeed');
```

Imports the `createUserSeed` function from `userSeed.js`.

The `{ createUserSeed }` means:  
“From that file’s exports, take only `createUserSeed`.”

---

### Line 3
```js
const users = createUserSeed();
```

Calls the seeder and stores the result in `users`.

So `users` becomes something like:

```js
[
  { id: 1, username: 'admin', passwordHash: '...', role: 'admin' },
  { id: 2, username: 'operator', passwordHash: '...', role: 'operator' },
]
```

This list lives in **RAM** (memory) while the server is running.  
If you restart the server, it is created again from `userSeed.js`.

---

### Lines 5–7
```js
function findByUsername(username) {
    return users.find((u) => u.username === username) || null;
}
```

Looks for one user by username.

- `users.find(...)` checks each user `u`
- `(u) => u.username === username` means “username matches?”
- If found → return that user object
- If not found → `find` returns `undefined`, then `|| null` turns it into `null`

**Used where?** Login: “Does this username exist?”

Example:
```js
findByUsername('admin')     // returns admin user
findByUsername('unknown')   // returns null
```

---

### Lines 9–11
```js
function findById(id) {
    return users.find((u) => u.id === id) || null;
}
```

Same idea, but search by `id` (number).

**Used where?** `/api/auth/me` after JWT login: token has user id → fetch full user.

Example:
```js
findById(1)   // admin
findById(99)  // null
```

---

### Lines 13–20 (very important)
```js
function toPublicUser(user) {
    return {
        id: user.id,
        username: user.username,
        role: user.role,
    };
}
```

Creates a **safe copy** of the user for sending to the frontend.

It keeps:
- `id`
- `username`
- `role`

It removes:
- `passwordHash`

**Why?**  
If you send `passwordHash` to the browser, attackers could steal it from network responses.  
Frontend only needs public info to show “Logged in as admin”.

---

### Lines 22–26
```js
module.exports = {
    findByUsername,
    findById,
    toPublicUser,
};
```

Exports those 3 helper functions so auth controller can use them:

```js
const userStore = require('../data/userStore');

userStore.findByUsername('admin');
userStore.toPublicUser(user);
```

---

### Tiny mental model

```text
userSeed.js  →  creates starter users (with hashed passwords)
      ↓
userStore.js →  keeps users in memory + finding helpers
      ↓
auth.controller.js → login checks username/password, returns token + public user
```

### Store vs Seed (easy difference)

| File | Job |
|---|---|
| `userSeed.js` | “Make the starting users” |
| `userStore.js` | “Keep them and let me search safely” |

Next natural file to learn: `auth.controller.js` (login logic). Say if you want that explained the same way.

---

**User**

yes, explain me@back-end/src/controllers/auth-controller/auth.controller.js now

---

**Cursor**

This file is the **brain of login**.  
It has 2 jobs:

1. `login` → check username/password, give a token  
2. `me` → “Who am I?” using that token

---

## Top imports (lines 1–4)

```js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const userStore = require('../../data/userStore');
```

| Import | Purpose |
|---|---|
| `bcrypt` | Compare typed password with stored hash |
| `jwt` | Create a login token |
| `env` | Read `JWT_SECRET` and `JWT_EXPIRES_IN` from `.env` |
| `userStore` | Find users in memory |

---

## Function 1: `login` (lines 6–40)

This runs when frontend/Postman calls:

`POST /api/auth/login`  
body: `{ "username": "admin", "password": "admin123" }`

### Lines 6–7
```js
function login(req, res) {
    const { username, password } = req.body ?? {};
```

- `req` = incoming request (data from client)
- `res` = response you send back
- `req.body` = JSON body
- `?? {}` = if body is missing, use empty object `{}` so app doesn’t crash

This pulls `username` and `password` out of the body.

---

### Lines 9–11 — validation
```js
if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
}
```

If either field is empty → stop and return **400 Bad Request**.

`return` is important: it stops the function so later code does not run.

---

### Lines 13–17 — find user
```js
const user = userStore.findByUsername(String(username).trim());
if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
}
```

- `String(username)` = force it to text
- `.trim()` = remove spaces around it (`" admin "` → `"admin"`)
- Search user in `userStore`
- If not found → **401 Unauthorized**

Same error message for wrong username/password on purpose, so attackers can’t easily guess “this username exists”.

---

### Lines 19–22 — check password
```js
const ok = bcrypt.compareSync(password, user.passwordHash);
if (!ok) {
    return res.status(401).json({ error: 'Invalid username or password' });
}
```

- `password` = what user typed now
- `user.passwordHash` = scrambled password from seed
- `compareSync` returns `true` if they match

If wrong password → also **401**.

---

### Lines 24–34 — create JWT token
```js
const token = jwt.sign(
    {
        sub: user.id,
        username: user.username,
        role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
);
```

`jwt.sign(...)` creates a signed token string.

Think of JWT like a **signed ID card**:

1. **Payload** (data inside):
   - `sub` = user id (JWT convention for “subject”)
   - `username`
   - `role`
2. **Secret** (`env.jwtSecret`) = stamp that proves backend made this token
3. **expiresIn** = card expires (example `8h`)

Frontend will send this token later in headers:
`Authorization: Bearer <token>`

---

### Lines 36–39 — success response
```js
return res.status(200).json({
    token,
    user: userStore.toPublicUser(user),
});
```

Send back:
- `token` → for future authenticated requests
- `user` → safe public info (no password hash)

Status **200** = success.

Example response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

---

## Function 2: `me` (lines 42–49)

This answers: “I already have a token. Who is logged in?”

Usually called as:
`GET /api/auth/me`  
with header `Authorization: Bearer <token>`

### Important idea
`me` assumes **auth middleware already checked the token** and put decoded data into `req.user`.

So `req.user` might look like:
```js
{ sub: 1, username: 'admin', role: 'admin', iat: ..., exp: ... }
```

### Lines 44–48
```js
const user = userStore.findById(req.user.sub);
if (!user) {
    return res.status(404).json({ error: 'User not found' });
}
return res.status(200).json({ user: userStore.toPublicUser(user) });
```

1. Take user id from token (`req.user.sub`)
2. Find that user in memory
3. If missing → 404
4. If found → return public user

Why needed? When user refreshes the page, frontend can restore session from token.

---

## Exports (lines 51–54)

```js
module.exports = {
    login,
    me,
};
```

Makes both functions available to `auth.routes.js`, which connects them to URLs.

---

## Login flow (beginner picture)

```text
Frontend sends username + password
        ↓
login()
  1. validate fields
  2. find user by username
  3. compare password with hash
  4. create JWT token
  5. return { token, user }
        ↓
Frontend saves token
        ↓
Later requests send: Authorization: Bearer token
        ↓
auth middleware verifies token → sets req.user
        ↓
me() returns current user
```

---

## Status codes used here

| Code | Meaning in this file |
|---|---|
| 200 | Login / me success |
| 400 | Missing username or password |
| 401 | Wrong credentials |
| 404 | Token ok, but user id not found in store |

---

Next natural file: `auth.middleware.js` (the gatekeeper that checks the token before protected routes). Want that next?

---

**User**

yes explain that next

---

**Cursor**

`auth.middleware.js` is the **security gatekeeper**.

A middleware is a function that runs **before** your controller.

```text
Request → middleware (check token) → controller (login/me/usage)
```

If the check fails, request stops.  
If it passes, it calls `next()` to continue.

---

## Imports (lines 1–2)

```js
const jwt = require('jsonwebtoken');
const env = require('../config/env');
```

- `jwt` = verify token
- `env.jwtSecret` = same secret used when creating the token in `login`

If secrets don’t match, verification fails.

---

## Function 1: `requireAuth` (lines 4–19)

This answers: **“Is this person logged in with a valid token?”**

### Line 4
```js
function requireAuth(req, res, next) {
```

Middleware gets 3 arguments:

| Name | Meaning |
|---|---|
| `req` | request data |
| `res` | response helper |
| `next` | “OK, continue to next function” |

---

### Lines 5–6
```js
const header = req.headers.authorization || '';
const [scheme, token] = header.split(' ');
```

Frontend should send:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

So:
- `header` = full string `"Bearer eyJ..."`
- `.split(' ')` splits by space → `["Bearer", "eyJ..."]`
- `scheme` = `"Bearer"`
- `token` = `"eyJ..."`

`|| ''` means: if header is missing, use empty string so code doesn’t crash.

---

### Lines 8–10
```js
if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid token' });
}
```

Reject if:
- word is not exactly `Bearer`, or
- token part is empty

**401** = not authenticated (“I don’t know who you are”).

---

### Lines 12–15 — verify token
```js
try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload; // { sub, username, role, iat, exp }
    return next();
}
```

`jwt.verify(...)` checks:

1. Token signature is valid (made with your secret)
2. Token is not expired

If OK, `payload` is the data put inside during login:

```js
{
  sub: 1,
  username: 'admin',
  role: 'admin',
  iat: ...,  // issued at
  exp: ...   // expire time
}
```

Then:

```js
req.user = payload;
```

This attaches user info to the request so later code (like `me`) can use `req.user.sub`.

Then:

```js
return next();
```

Means: “Gate open, go to controller.”

---

### Lines 16–18 — bad token
```js
catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
}
```

If token is fake, broken, or expired → catch error → return 401.

---

## Function 2: `requireRole` (lines 21–28)

This answers: **“Is this logged-in person allowed to do this action?”**

Example use in routes:

```js
router.delete('/usage/:id', requireAuth, requireRole('admin'), deleteUsage);
```

Meaning:
1. Must be logged in
2. Must have role `admin`

### Line 21
```js
function requireRole(...roles) {
```

`...roles` means you can pass one or more roles:

```js
requireRole('admin')
requireRole('admin', 'operator')
```

### Lines 22–27
```js
return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
};
```

This returns another middleware function.

Check:
- Is `req.user` missing? → forbidden
- Is user’s role not in allowed list? → forbidden

**403** = authenticated, but not allowed (“I know who you are, but you can’t do this”).

Difference beginners must remember:

| Code | Meaning |
|---|---|
| **401** | Not logged in / bad token |
| **403** | Logged in, but no permission |

---

## Exports (lines 30–33)

```js
module.exports = {
    requireAuth,
    requireRole,
};
```

Other files (routes) can import and use them.

---

## Full picture with your auth files

```text
1) login (auth.controller)
   username+password OK → create JWT token

2) frontend stores token

3) later request:
   Authorization: Bearer <token>

4) requireAuth (this file)
   verify token → put data in req.user → next()

5) requireRole (optional)
   check role → next() or 403

6) controller (me / createUsage / deleteUsage)
   does the real work
```

---

## Tiny analogy

- `login` = get your ID card  
- `requireAuth` = security checks ID card at the door  
- `requireRole` = checks if your job title allows entering that room  
- controller = the actual work inside the room  

---

Next natural file: `auth.routes.js` (connects URLs to `login` / `me` + middleware). Want that next?

---

**User**

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Error</title>
</head>

<body>
    <pre>Cannot POST /api/login</pre>
</body>

</html>

i got this error when hitting {{base_url}}/api/login with body

  "username":"admin",
    "password":"admin123"
in postman

---

**Cursor**

That error means Express has no `POST /api/login` route. I'll check how auth is wired in your backend.

Two issues: auth routes aren't mounted in `app.js`, and the correct path is `/api/auth/login` (not `/api/login`). Wiring auth into `app.js` now.

### Why you got that error

`Cannot POST /api/login` means Express has **no route** for that URL.

You had:
1. `auth.routes.js` ready with `POST /login`
2. But `app.js` only mounted usage routes — **auth was never connected**
3. You also called the wrong path (`/api/login` instead of `/api/auth/login`)

How the URL is built:

```text
app.use('/api/auth', authRoutes)  +  router.post('/login', login)
= POST /api/auth/login
```

### What to do in Postman

1. Restart the backend (`npm run dev` in `back-end`) so `app.js` reload picks up the change
2. Call:

```http
POST {{base_url}}/api/auth/login
```

3. Headers: `Content-Type: application/json`
4. Body → raw → JSON:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

You should get something like:

```json
{
  "token": "eyJ...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

Then for protected routes, add header:

```http
Authorization: Bearer <paste_token_here>
```

---

**User**

usage.routes.js explain this now

---

**Cursor**

`usage.routes.js` is the **URL map for usage CRUD**.  
It decides: which URL + method → which controller, and who is allowed.

In `app.js` you mounted it like this:

```js
app.use('/api', usageRoutes);
```

So every path here gets `/api` in front.

---

## Lines 1–3 — create a router

```js
const express = require('express');
const router = express.Router();
```

- Load Express
- Create a mini “route book” called `router`

Think of `router` as a list of rules for usage APIs only.

---

## Lines 5–10 — import controllers

```js
const { 
    getUsage, 
    createUsage, 
    updateUsage, 
    deleteUsage 
} = require('../controllers/usage-controller/usage.controller');
```

These are the functions that do the real work:

| Function | Job |
|---|---|
| `getUsage` | read usage list |
| `createUsage` | add new usage |
| `updateUsage` | edit usage |
| `deleteUsage` | remove usage |

The route file only **connects URLs**. Controllers do the logic.

---

## Line 12 — import security

```js
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
```

- `requireAuth` = must be logged in (valid JWT)
- `requireRole` = must have a specific role (like admin)

---

## Line 15 — protect ALL usage routes

```js
router.use(requireAuth);
```

This is powerful.

It means: **every route below this line** must pass `requireAuth` first.

So before `getUsage` / `createUsage` / etc. runs:

1. Check `Authorization: Bearer <token>`
2. If bad/missing → `401`
3. If OK → put user into `req.user`, then continue

Beginner picture:

```text
Request → requireAuth → route handler (get/create/update/delete)
```

---

## Lines 17–19 — normal CRUD routes

```js
router.get('/usage', getUsage);
router.post('/usage', createUsage);
router.patch('/usage/:id', updateUsage);
```

Final full URLs (because of `/api` in `app.js`):

| Method | Full URL | Meaning |
|---|---|---|
| `GET` | `/api/usage` | list all (or filter with `?subscriberId=SUB01`) |
| `POST` | `/api/usage` | create new record |
| `PATCH` | `/api/usage/1` | update record with id `1` |

### What is `:id`?
`:id` is a **URL parameter** (dynamic value).

Example:
- request: `PATCH /api/usage/3`
- inside controller: `req.params.id` → `"3"`

---

## Lines 21–22 — delete only for admin

```js
router.delete('/usage/:id', requireRole('admin'), deleteUsage);
```

Order matters:

```text
1) requireAuth   (from router.use above) → must be logged in
2) requireRole('admin')                  → must be admin
3) deleteUsage                           → actually delete
```

So:
- no token → `401`
- logged in as `operator` → `403 Forbidden`
- logged in as `admin` → delete succeeds (`204`)

---

## Line 24 — export

```js
module.exports = router;
```

Makes this router usable in `app.js`.

---

## Full request example (Postman)

1. Login first: `POST /api/auth/login`
2. Copy token
3. Call usage with header:

```http
Authorization: Bearer <token>
```

Examples:
- `GET /api/usage`
- `POST /api/usage` with JSON body
- `PATCH /api/usage/1` with JSON body
- `DELETE /api/usage/1` (admin only)

---

## Tiny mental model

```text
auth.routes.js   →  login / me
usage.routes.js  →  usage CRUD + permission rules
controllers      →  real create/read/update/delete code
middleware       →  security checks
```

---

### One note for Q2 later
Because `router.use(requireAuth)` protects **GET** too, your cron snapshot must also send a token (or you later make GET public). That’s fine for now while testing with Postman.

Next useful file to learn: `auth.routes.js` (very short), or one usage controller like `usage-create.controller.js`. Which one do you want?

---

**User**

i get this error

"error": "Invalid or expired token"

when hitting {{base_url}}/api/usage with bearer token

---

**Cursor**

That error means `jwt.verify` failed. I'll check how the token is created vs verified and reproduce the login → `/api/usage` flow.

Your backend is fine. I tested it just now:

1. Login → got a token  
2. `GET /api/usage` with that token → **worked** (3 records)

So `"Invalid or expired token"` almost always means **Postman is sending a bad/old token**, not that your route code is broken.

That message comes from this part in `auth.middleware.js`:

```js
jwt.verify(token, env.jwtSecret)  // failed → catch → "Invalid or expired token"
```

---

### Most common beginner mistakes

#### 1) Using an old token
Every time the server restarts (nodemon restarts a lot), old tokens can become invalid if secret/process changed.

**Fix:** login again, copy a **new** token, then call `/api/usage`.

#### 2) Writing `Bearer` twice
In Postman:

- Auth tab → Type: **Bearer Token**
- Token field should be **only** the token:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Do **not** put:

```text
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Postman already adds `Bearer ` for you.

If you also type `Bearer`, the header becomes:

```text
Authorization: Bearer Bearer eyJ...
```

→ verify fails.

#### 3) Copying the wrong value
Copy only the `token` string from login response, not the whole JSON.

Good:
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxx.yyyy
```

Bad:
```text
"token": "eyJ..."
```
or
```text
{ "token": "eyJ...", "user": {...} }
```

#### 4) Extra spaces/quotes
No `"..."` around the token in the Bearer field. No space at the start/end.

---

### Correct Postman steps

1. `POST {{base_url}}/api/auth/login`
```json
{
  "username": "admin",
  "password": "admin123"
}
```

2. From response, copy `token` value only

3. `GET {{base_url}}/api/usage`
   - Authorization → **Bearer Token**
   - Paste token only
   - Send

You should get the usage array.

---

### Quick checklist

| Check | Expected |
|---|---|
| Login URL | `/api/auth/login` |
| Usage URL | `/api/usage` |
| Auth type | Bearer Token |
| Token value | raw `eyJ...` only (no `Bearer`, no quotes) |
| Fresh token | login again after server restart |

If it still fails, paste a screenshot of your Postman **Authorization** tab (hide most of the token) and I’ll tell you exactly what’s wrong.

---

**User**

@back-end/src/app.js explain this to me now

---

**Cursor**

`app.js` is the **main setup file** for your Express backend.  
It builds the app, adds plugins (middleware), and connects your routes.

`server.js` starts the server.  
`app.js` defines **what the server can do**.

---

## Lines 1–10 — imports

```js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const usageRoutes = require('./routes/usage.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
```

| Import | Simple meaning |
|---|---|
| `express` | Web framework to make APIs |
| `cors` | Allow frontend (different port) to call backend |
| `helmet` | Adds safer HTTP headers |
| `morgan` | Logs each request in terminal (helpful for debugging) |
| `authRoutes` | Login / me routes |
| `usageRoutes` | Usage CRUD routes |
| `notFound` | Handles unknown URLs |
| `errorHandler` | Handles unexpected errors |

---

## Line 13 — create the app

```js
const app = express();
```

This creates your Express application object.  
Everything below attaches features to this `app`.

---

## Lines 15–18 — global middleware (run for almost every request)

```js
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
```

### `helmet()`
Protects basic security headers (like locking some browser attack doors).

### `cors({ origin: true, credentials: true })`
Allows your Vue app (`localhost:5173`) to call backend (`localhost:3000`).

Without CORS, browser blocks frontend → backend calls.

- `origin: true` = reflect request origin (good for local dev)
- `credentials: true` = allow cookies/auth-related headers if needed

### `express.json()`
Reads JSON body from requests and puts it in `req.body`.

So this works in login/create usage:
```json
{ "username": "admin", "password": "admin123" }
```

Without this, `req.body` would be empty/undefined.

### `morgan('dev')`
Prints request logs like:
```text
POST /api/auth/login 200 12ms
GET /api/usage 401 3ms
```

Very useful while learning.

---

## Lines 20–23 — connect routes

```js
app.use('/api/auth', authRoutes);
app.use('/api', usageRoutes);
```

This is how URLs are built.

### Auth
`/api/auth` + routes inside `auth.routes.js`:

| In auth.routes | Final URL |
|---|---|
| `POST /login` | `POST /api/auth/login` |
| `GET /me` | `GET /api/auth/me` |

### Usage
`/api` + routes inside `usage.routes.js`:

| In usage.routes | Final URL |
|---|---|
| `GET /usage` | `GET /api/usage` |
| `POST /usage` | `POST /api/usage` |
| `PATCH /usage/:id` | `PATCH /api/usage/1` |
| `DELETE /usage/:id` | `DELETE /api/usage/1` |

---

## Lines 25–26 — fallback handlers

```js
app.use(notFound);
app.use(errorHandler);
```

### `notFound`
If no route matched (example: `/api/unknown`) → return 404.

### `errorHandler`
If something throws an unexpected error → return 500 safely.

Order matters:
1. normal middleware
2. routes
3. notFound
4. errorHandler (always last)

---

## Line 27 — export app

```js
module.exports = app;
```

Exports the configured app so `server.js` can start it:

```js
const app = require('./app');
app.listen(3000, ...);
```

---

## Request flow (beginner picture)

```text
Postman/Frontend request
        ↓
helmet / cors / express.json / morgan
        ↓
match route?
   ├─ /api/auth/... → auth.routes → auth controller
   ├─ /api/usage... → usage.routes → auth middleware → usage controller
   └─ no match → notFound
        ↓
if crash/error → errorHandler
```

---

## `app.js` vs `server.js` (easy difference)

| File | Job |
|---|---|
| `app.js` | Configure features + routes (“what the app is”) |
| `server.js` | Start listening on a port (“turn the app on”) |

---

## Tiny analogy

- `app.js` = restaurant menu + kitchen rules  
- routes = menu sections (Auth, Usage)  
- controllers = chefs cooking the order  
- `server.js` = opening the restaurant door on port 3000  

If you want next, we can explain `notFound.js` + `errorHandler.js` together (they’re short).

---

**User**

In quick backend test with curl section, where do i put the command?

---

**Cursor**

Put those commands in your **terminal** (not inside a `.js` file, and not in Postman).

### Where exactly

1. Open a terminal in Cursor: **Terminal → New Terminal**
2. Make sure backend is running in another terminal (`cd back-end` → `npm run dev`)
3. In a **second** terminal, paste the curl command and press Enter

You can run it from any folder. It just needs the server on `http://localhost:3000`.

---

### On your Windows machine

You’re using **PowerShell**. Plain `curl` there is often an alias for `Invoke-WebRequest`, so the doc’s `curl` examples can fail.

**Easiest options for you:**

#### Option A — Postman (recommended while learning)
You already did this. Same test, GUI instead of curl.

#### Option B — PowerShell command
Login:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
```

Then copy the `token`, and:

```powershell
Invoke-RestMethod -Method Get `
  -Uri "http://localhost:3000/api/usage" `
  -Headers @{ Authorization = "Bearer PASTE_TOKEN_HERE" }
```

#### Option C — real curl in PowerShell
Use `curl.exe` (with `.exe`):

```powershell
curl.exe -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

---

### Tiny mental model

| Tool | Where you type |
|---|---|
| `npm run dev` | Terminal (starts server) |
| curl / PowerShell test | Another terminal (calls the API) |
| Postman | Postman app (also calls the API) |
| Vue frontend | Browser |

So: **terminal = place for curl commands**. Postman is the friendlier alternative on Windows.

---

**User**

I want to open and continue this project from another device, what do i need to setup before being able to continue. Please write it on readme.md

---

**Cursor**

I'll check the current project setup and write a root `README.md` with everything needed to continue on another device.

Updated root `README.md` with a full “continue on another device” setup guide. Also filled `back-end/.env.example` as a safe template.

### On the new device, you mainly need
1. **Git + Node.js LTS**
2. `git clone` / `git pull`
3. Recreate `back-end/.env` (it is **not** in Git)
4. `npm install` in both `back-end` and `front-end`
5. Run `npm run dev` in both folders

### Important warning
Your learning guide `docs/` is **gitignored**, so it will **not** appear after clone. Copy that folder from this device (USB/cloud) if you still want `GOLDEN-APP-FLOW.md` on the other machine.

Commit/push `README.md` (and `.env.example`) when you’re ready so the new device can pull them.

---

**User**

i think youre missing nvm 

---

**Cursor**

I'll add `nvm` to the setup section in `README.md` (including Windows `nvm-windows`).

Updated. `README.md` now includes **nvm** setup.

### What changed
- Install **nvm first**, then Node through nvm (not from nodejs.org)
- Windows: **nvm-windows** → `nvm install 24` / `nvm use 24`
- Mac/Linux: nvm-sh install script
- Added `.nvmrc` with `24` (matches your current Node `v24.21.0`)
- Troubleshooting notes for missing `node`/`npm` and version mismatches

On a new Windows device, the key commands are:

```powershell
nvm install 24
nvm use 24
node -v
```

---

**User**

@docs/GOLDEN-APP-FLOW.md i've wrote the section 4 from this golden-app-flow document, now can you explain to  me how does that work?

---

**Cursor**

I'll read your Q2 implementation and explain how the snapshot flow works end to end.

Section 4 is your **automatic backup camera** for usage data.

Instead of a human opening Postman 3 times a day, the server wakes up, calls your own API, and saves the result as a CSV file.

---

## Big picture

```text
server starts
    ↓
startJobs() registers a cron alarm
    ↓
every day at 08:00, 12:00, 15:00 WIB
    ↓
saveUsageSnapshot()
    1. GET http://localhost:3000/api/usage
    2. convert JSON → CSV text
    3. save file in snapshots/
```

You also have 2 manual tools:
- `npm run snapshot:once` → take 1 snapshot now (for testing)
- `npm run cleanup:snapshots` → delete CSV files older than 30 days

---

## 1) Why `GET /usage` is public in your routes

```js
router.get('/usage', getUsage); // no requireAuth
router.post('/usage', requireAuth, createUsage);
```

Your cron job calls the API with axios like a normal HTTP client.  
It does **not** log in, so GET must be public (for this design).

Writes stay protected. That’s a good balance for Q2.

---

## 2) `server.js` — turn the scheduler on

```js
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startJobs();
});
```

Flow:
1. Start Express
2. When listening succeeds, call `startJobs()`

Why after `listen`?  
Because the job calls `http://localhost:3000/...`. The server must already be online.

---

## 3) `jobs/index.js` — the alarm clock

```js
cron.schedule(
  '0 8,12,15 * * *',
  () => { saveUsageSnapshot().catch(...) },
  { timezone: 'Asia/Jakarta' }
);
```

### Cron string meaning
```text
0 8,12,15 * * *
│ │       │ │ │
│ │       │ │ └─ day of week (any)
│ │       │ └─── month (any)
│ │       └───── day of month (any)
│ └───────────── hours 8, 12, and 15
└─────────────── minute 0
```

So: **exactly at 08:00, 12:00, 15:00**.

`timezone: 'Asia/Jakarta'` makes it WIB, not UTC.

`saveUsageSnapshot().catch(...)` is used because the function is `async`. If the API is down, it logs the error instead of crashing the whole server.

---

## 4) `snapshotUsage.job.js` — the real work

### Step A: where to save
```js
const SNAPSHOT_DIR = path.join(__dirname, '..', 'snapshots');
```

`__dirname` = folder of this file (`src/jobs`).

### Step B: JSON → CSV (`toCsv`)
Example API data:
```json
[
  { "id": 1, "subscriberId": "SUB01", "callMinutes": 40, ... }
]
```

Becomes:
```csv
id,subscriberId,callMinutes,smsCount,dataUsageMB,timestamp
"1","SUB01","40","10","1500","2025-08-01T..."
```

Quotes around values help if a value ever contains commas.

### Step C: file name (`buildFileName`)
Uses Jakarta time parts to build:
```text
usage-YYYYMMDD-HHmmss-WIB.csv
```
Example:
```text
usage-20260924-080000-WIB.csv
```

Why include time? So 08:00 / 12:00 / 15:00 don’t overwrite each other.

### Step D: save (`saveUsageSnapshot`)
```js
const { data } = await axios.get(API_URL);   // call your own API
fs.writeFileSync(filePath, toCsv(data), 'utf8'); // write CSV file
```

This matches the PDF: **call your retrieval endpoint**, don’t read the memory array directly.

---

## 5) `runSnapshotOnce.js` — test without waiting until 08:00

```js
saveUsageSnapshot()
  .then(() => process.exit(0))
  .catch((err) => process.exit(1));
```

Run while server is up:

```bash
cd back-end
npm run snapshot:once
```

If success → exit code 0.  
If fail → exit code 1.

---

## 6) `cleanupSnapshots.js` — delete old files

```js
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
```

For each `.csv`:
1. check file age (`mtime`)
2. if older than 30 days → `unlink` (delete)

Run:

```bash
npm run cleanup:snapshots
```

This is separate from cron on purpose (PDF asks for a separate cleanup script).

---

## End-to-end story (beginner version)

```text
1. You start backend (npm run dev)
2. Cron registers alarms for 08:00/12:00/15:00 WIB
3. At alarm time:
   - axios GET /api/usage
   - convert response to CSV
   - save usage-...-WIB.csv
4. Later, cleanup script removes files older than 30 days
```

---

## Two bugs to fix in your current code

### 1) Snapshot folder path is probably wrong
In `snapshotUsage.job.js`:
```js
path.join(__dirname, '..', 'snapshots')
// from src/jobs → becomes src/snapshots
```

But cleanup uses:
```js
path.join(__dirname, '../../snapshots')
// from src/scripts → becomes back-end/snapshots
```

They should point to the **same** folder (`back-end/snapshots`).

Fix in job file:
```js
const SNAPSHOT_DIR = path.join(__dirname, '../../snapshots');
```

### 2) Log message won’t show the file name
You wrote:
```js
console.log('[snapshot] saved ${fileName}'); // single quotes
```

Use backticks:
```js
console.log(`[snapshot] saved ${fileName}`);
```

---

## How to verify it works

1. Terminal A: `npm run dev`
2. Terminal B: `npm run snapshot:once`
3. Check `back-end/snapshots/` for a new `.csv`
4. Open the CSV — should contain usage rows

If `snapshot:once` fails with connection error, backend is not running.  
If it fails with 401, GET `/usage` is still protected (yours is currently public, so this should be fine).

If you want, next I can walk line-by-line through only `toCsv` + `buildFileName`, since those are usually the most confusing parts for beginners.

---

**User**

@snapshotUsage.job.js (41-60) explain to me again how these line of codes work

---

**Cursor**

This part is the **“take a photo of usage data and save it as a CSV file”** function.

---

### Line 41
```js
async function saveUsageSnapshot() {
```

- `async` means this function can wait for slow work (like calling the API)
- Inside, you can use `await`

---

### Lines 42–44
```js
if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}
```

Plain English:
> If the snapshots folder does not exist, create it.

- `fs.existsSync(...)` = check “does this folder exist?”
- `!` = “does NOT exist”
- `fs.mkdirSync(...)` = create folder
- `recursive: true` = also create parent folders if needed

Why? So writing the CSV doesn’t crash when the folder is missing.

---

### Line 46
```js
const { data } = await axios.get(API_URL);
```

This is the most important line.

1. Call your API: `GET http://localhost:3000/api/usage`
2. Wait until response comes back (`await`)
3. Take only the JSON body (`data`)

Example `data`:
```js
[
  { id: 1, subscriberId: 'SUB01', callMinutes: 40, ... },
  { id: 2, subscriberId: 'SUB02', ... }
]
```

`{ data }` is destructuring:
```js
const response = await axios.get(API_URL);
const data = response.data;
```

Same thing, shorter.

---

### Lines 47–48
```js
const fileName = buildFileName();
const filePath = path.join(SNAPSHOT_DIR, fileName);
```

- `buildFileName()` makes something like:  
  `usage-20260924-220000-WIB.csv`
- `path.join(...)` combines folder + file name into a full path

Example:
```text
C:\...\back-end\snapshots\usage-20260924-220000-WIB.csv
```

---

### Line 50
```js
fs.writeFileSync(filePath, toCsv(data), 'utf8');
```

This actually saves the file.

| Part | Meaning |
|---|---|
| `filePath` | where to save |
| `toCsv(data)` | convert JSON array → CSV text |
| `'utf8'` | text encoding |

`writeFileSync` = write now and wait until finished.

---

### Line 51
```js
console.log('[snapshot] saved ${fileName}');
```

Prints a message in the terminal.

Small bug: with **single quotes**, `${fileName}` is printed as literal text.

Use backticks:
```js
console.log(`[snapshot] saved ${fileName}`);
```

Then it prints:
```text
[snapshot] saved usage-20260924-220000-WIB.csv
```

---

### Line 52
```js
return filePath;
```

Gives the saved file path back to whoever called this function  
(useful for scripts/tests).

---

### Lines 55–59
```js
module.exports = {
    saveUsageSnapshot,
    toCsv,
    buildFileName,
};
```

Exports these functions so other files can use them, like:

- `jobs/index.js` (cron)
- `scripts/runSnapshotOnce.js` (manual test)

---

## Tiny flow of this function only

```text
1. Ensure snapshots folder exists
2. GET /api/usage  → get JSON
3. Build file name with Jakarta time
4. Convert JSON → CSV
5. Write CSV to disk
6. Log + return file path
```

That’s the whole job of lines 41–60.

---

**User**

@c:\Users\diesa\.cursor\projects\c-Users-diesa-OneDrive-Documents-Wawei-Dawei-huawei-technical-test\terminals\1.txt:37-43 help

---

**Cursor**

You're in the **repo root**, and that folder has no `dev` script.

Your path is:
```text
huawei-technical-test   ← you are here (no npm run dev)
├── back-end/           ← has npm run dev
└── front-end/          ← has npm run dev
```

### Fix — start backend

```powershell
cd back-end
npm install
npm run dev
```

### If you also want frontend (new terminal)

```powershell
cd front-end
npm install
npm run dev
```

You should see something like `Server running on port 3000` from `back-end`.

---

**User**

@front-end/src/router/route.js please explain this file for me

---

**Cursor**

This file is your frontend **map + security gate**.

It decides:
1. Which URL shows which page
2. Who is allowed to open that page (login required or not)

---

## Lines 1–2 — imports

```js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
```

- `vue-router` = Vue’s navigation system
- `useAuthStore` = your Pinia auth store (token, user, login state)

---

## Lines 4–21 — route list

```js
const routes = [ ... ]
```

Each object = one page rule.

### Login route
```js
{
  path: '/login',
  name: 'login',
  component: () => import('../views/auth/LoginPage.vue'),
  meta: { guestOnly: true },
}
```

| Field | Meaning |
|---|---|
| `path` | URL in browser: `/login` |
| `name` | Internal nickname (`login`) |
| `component` | Which Vue page to show |
| `meta.guestOnly` | Only for guests (not logged in) |

`()` => `import(...)` = **lazy load**  
Page code is downloaded only when needed (faster first load).

### Usage route
```js
{
  path: '/usage',
  name: 'usage',
  component: () => import('../views/usage/UsageListPage.vue'),
  meta: { requiresAuth: true },
}
```

`requiresAuth: true` means: must be logged in.

### Home route `/` — currently incomplete
```js
{
  path: '/',
  name: '/usage',
},
```

This looks unfinished/wrong:
- no `component`
- no `redirect`
- `name: '/usage'` is unusual (name should be like `'home'`, not a path)

What you probably want (from the golden guide):

```js
{
  path: '/',
  redirect: '/usage',
}
```

Meaning: open `/` → automatically go to `/usage`.

---

## Lines 23–26 — create the router

```js
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
```

- `createRouter(...)` builds the router
- `createWebHistory` = normal clean URLs (`/login`, `/usage`)
- `routes` = your page list above

---

## Lines 28–45 — auth guard (very important)

```js
router.beforeEach(async (to) => { ... })
```

This runs **before every page change**.

`to` = the page the user is trying to open.

### Step 1 — restore session
```js
if (auth.token && !auth.user) {
  await auth.restoreSession()
}
```

If token exists in localStorage, but user object is missing  
→ call `/api/auth/me` to rebuild user info.

Useful after refresh.

### Step 2 — protect private pages
```js
if (to.meta.requiresAuth && !auth.isAuthenticated) {
  return { name: 'login', query: { redirect: to.fullPath } }
}
```

If page needs login and user is not logged in:
- send them to login
- also save where they wanted to go (`?redirect=/usage`)

After login, you can send them back.

### Step 3 — keep logged-in users out of login page
```js
if (to.meta.guestOnly && auth.isAuthenticated) {
  return { name: 'usage' }
}
```

If already logged in and they open `/login`  
→ redirect to `/usage`.

### Step 4 — allow navigation
```js
return true
```

Means: “OK, open this page.”

---

## Line 47 — export

```js
export default router
```

So `main.js` can do:

```js
app.use(router)
```

---

## Beginner flow picture

```text
User opens /usage
        ↓
beforeEach guard runs
        ↓
Has token? 
  no  → go to /login
  yes → show UsageListPage
```

```text
User opens /login while already logged in
        ↓
guestOnly + authenticated
        ↓
redirect to /usage
```

---

## Tiny analogy

- `routes` = building floor directory  
- `beforeEach` = security checking ID before entering a room  
- `meta.requiresAuth` = “staff only room”  
- `meta.guestOnly` = “visitor registration desk”

---

## One fix to make soon

Replace the broken `/` route with:

```js
{
  path: '/',
  redirect: '/usage',
}
```

Otherwise `/` may not navigate correctly.

If you want, next I can explain `stores/auth.js` the same beginner way — it connects directly to this guard.

