# Huawei Technical Test

Dian Aries Alfatah - Junior Software Engineer

This repo is my solution for the Huawei technical test.  
I built a small **Subscriber Usage console**: Express API on the backend, Vue 3 dashboard on the frontend, plus a Postman collection for API checks.

Everything is meant to be reviewed **locally** (no deployed URL).

---

## What’s inside

| Question | What I implemented                                                            |
| -------- | ----------------------------------------------------------------------------- |
| **Q1**   | Subscriber Usage CRUD API + UI (JWT auth, role-based delete)                  |
| **Q2**   | Automated usage snapshots (cron, CSV files, cleanup, download)                |
| **Q3**   | SQL setup + answers (shown on the Database Integration page with screenshots) |
| **Q4**   | Bug explanation for the broken `reduce` snippet + interactive demo            |

---

## Tech stack

### Backend (`back-end/`)

- **Node.js** (pinned to **v24** via `.nvmrc`; v20+ should work)
- **Express 5** — REST API
- **jsonwebtoken** + **bcryptjs** — login / auth
- **node-cron** — scheduled snapshots (WIB / Asia/Jakarta)
- **axios** — snapshot job calls `GET /api/usage` then writes CSV
- **dotenv**, **cors**, **helmet**, **morgan**
- Storage for usage + users: **in-memory** (seeded on startup; resets when the server restarts)

### Frontend (`front-end/`)

- **Vue 3** + **Vite**
- **Vue Router** — login + dashboard routes, auth guards
- **Pinia** — auth store (token / user in `localStorage`)
- **Axios** — API client (`/api` proxied to backend in dev)
- **Tailwind CSS 4** + **DaisyUI** — UI
- **Lucide Vue** — icons

### API docs / testing (`postman-collection/`)

- Exported Postman collection: `postman.postman_collection.json`

### Optional (Q3 practice)

- [DB Browser for SQLite](https://sqlitebrowser.org/) if you want to run the SQL files yourself

---

## Project structure

```text
huawei-technical-test/
├── back-end/
│   ├── src/
│   │   ├── app.js                 # Express app, route mounts, optional FE dist serve
│   │   ├── server.js              # boot server + start cron jobs
│   │   ├── config/env.js          # PORT, JWT_SECRET, JWT_EXPIRES_IN
│   │   ├── routes/                # auth, usage, snapshots
│   │   ├── controllers/           # request handlers
│   │   ├── middlewares/           # auth, 404, error handler
│   │   ├── data/                  # in-memory stores + seeders
│   │   ├── jobs/                  # cron schedule + snapshot writer
│   │   └── scripts/               # one-off snapshot / cleanup CLI
│   ├── snapshots/                 # generated CSV files land here
│   ├── sql/                       # Q3 setup + answer SQL
│   ├── .env.example
│   └── package.json
├── front-end/
│   ├── src/
│   │   ├── api/                   # axios wrappers (auth, usage, snapshots)
│   │   ├── stores/auth.js         # Pinia auth
│   │   ├── router/route.js
│   │   ├── views/                 # login + dashboard pages
│   │   └── components/usage/      # table + form modal
│   ├── public/q3/                 # Q3 screenshot evidence
│   ├── vite.config.js             # /api → localhost:3000 proxy
│   └── package.json
├── postman-collection/
│   └── postman.postman_collection.json
├── .nvmrc
└── README.md
```

---

## Architecture (how the pieces talk)

```text
Browser (Vue @ :5173)
   │  Axios → /api/...
   │  (Vite proxy in dev)
   ▼
Express API (:3000)
   ├── /api/auth/*      JWT login + /me
   ├── /api/usage/*     CRUD (in-memory usageStore)
   └── /api/snapshots/* cron status, run, cleanup, download
            │
            ├── node-cron (08:00 / 12:00 / 15:00 Asia/Jakarta by default)
            └── snapshot job → GET /api/usage → write CSV under back-end/snapshots/
```

**Auth flow**

1. `POST /api/auth/login` → JWT + public user `{ id, username, role }`
2. Frontend stores token in Pinia / `localStorage`
3. Protected calls send `Authorization: Bearer <token>`
4. `DELETE /api/usage/:id` is **admin only**; operator gets `403`

**Dev vs optional single-origin**

- Day-to-day: run backend + Vite separately (proxy handles CORS-ish routing via same `/api` path).
- If you build the frontend (`npm run build` in `front-end/`), Express can serve `front-end/dist` when that folder exists.

**Note on response shape**  
Usage and snapshot APIs wrap payloads with `message` + `status` (and `error` on failures). Auth login/me still return `{ token, user }` / `{ user }`.

---

## Requirements

- Node.js **v20+** (I used **v24**; see `.nvmrc`)
- npm
- Postman (optional, for the collection)
- DB Browser for SQLite (optional, for Q3)

### nvm (recommended)

```bash
nvm install 24
nvm use 24
node -v
```

---

## Setup

### 1. Clone / open the project

```bash
cd huawei-technical-test
```

### 2. Backend

```bash
cd back-end
npm install
```

Copy env:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `back-end/.env`:

```env
PORT=3000
JWT_SECRET=replace-this-with-a-long-random-string
JWT_EXPIRES_IN=8h
```

### 3. Frontend

```bash
cd front-end
npm install
```

No extra env file is required for local dev. Vite proxies `/api` to `http://localhost:3000`.

---

## Run locally

Use **two terminals**.

### Terminal A — backend

```bash
cd back-end
npm run dev
```

→ `http://localhost:3000`

### Terminal B — frontend

```bash
cd front-end
npm run dev
```

→ `http://localhost:5173`

Open the frontend URL, then log in with one of the demo accounts below.

### Useful backend scripts

Server must be running for `snapshot:once` (it hits the usage API):

```bash
cd back-end
npm run snapshot:once       # write one CSV now
npm run cleanup:snapshots   # delete CSVs older than schedule maxAgeDays (mtime-based)
```

---

## Demo accounts

| Username   | Password      | Role     | Notes                                  |
| ---------- | ------------- | -------- | -------------------------------------- |
| `admin`    | `admin123`    | admin    | Can create / update / **delete** usage |
| `operator` | `operator123` | operator | Can create / update; **cannot** delete |

---

## App pages (after login)

| Page                 | Path                              | Covers                                 |
| -------------------- | --------------------------------- | -------------------------------------- |
| Usage                | `/dashboard/usage`                | Q1 CRUD UI                             |
| Cron Job             | `/dashboard/cron-job`             | Q2 schedule / run / cleanup / download |
| Database Integration | `/dashboard/database-integration` | Q3 SQL + screenshots                   |
| Fix the Code         | `/dashboard/fix-the-code`         | Q4 explanation + demo                  |

---

## API overview

Base URL: `http://localhost:3000/api`

### Auth

| Method | Path          | Auth   |
| ------ | ------------- | ------ |
| `POST` | `/auth/login` | No     |
| `GET`  | `/auth/me`    | Bearer |

### Usage (Q1)

| Method   | Path                        | Auth               |
| -------- | --------------------------- | ------------------ |
| `GET`    | `/usage`                    | Public             |
| `GET`    | `/usage?subscriberId=SUB01` | Public             |
| `POST`   | `/usage`                    | Bearer             |
| `PATCH`  | `/usage/:id`                | Bearer             |
| `DELETE` | `/usage/:id`                | Bearer + **admin** |

Fields: `subscriberId`, `callMinutes`, `smsCount`, `dataUsageMB` (+ `id`, `timestamp`).

### Snapshots (Q2)

All require Bearer token.

| Method | Path                        |
| ------ | --------------------------- |
| `GET`  | `/snapshots`                |
| `PUT`  | `/snapshots/schedule`       |
| `POST` | `/snapshots/schedule/reset` |
| `POST` | `/snapshots/run`            |
| `POST` | `/snapshots/cleanup`        |
| `GET`  | `/snapshots/:fileName`      |

Defaults:

- Cron: `0 8,12,15 * * *` (08:00, 12:00, 15:00)
- Timezone: `Asia/Jakarta`
- Cleanup age: **30 days**, based on file **mtime** (LastWriteTime), not the date in the filename
- Output folder: `back-end/snapshots/`
- Filename pattern: `usage-YYYYMMDD-HHmmss-WIB.csv`

To test cleanup live without waiting 30 days, temporarily lower age via schedule:

```http
PUT /api/snapshots/schedule
Authorization: Bearer <token>
Content-Type: application/json

{ "maxAgeDays": 0 }
```

Then call `POST /api/snapshots/cleanup`. Reset with `POST /api/snapshots/schedule/reset` when done.

---

## Postman

Collection file:

```text
postman-collection/postman.postman_collection.json
```

1. Open Postman → **Import** → select that JSON
2. Create / select an environment with `base_url = http://localhost:3000`
3. Run **Login (admin)** first and save the token into your env (or collection auth)
4. Hit Usage / Snapshot requests as needed

Make sure the backend is running before you send requests.

---

## Q3 — SQL

Files under `back-end/sql/`:

- `q3-setup.sql` — schema + seed
- `q3-answers.sql` — answer queries
- `huawei-q3.db` — optional local SQLite file

Optional live practice:

1. Open/create the DB in DB Browser
2. Run setup
3. Run answers in order

The **Database Integration** page shows the SQL and screenshot evidence from `front-end/public/q3/`. It does **not** execute SQL against a live server DB.

---

## Q4 — Fix the code

The broken snippet misused `Array.reduce` (missing `return` and missing initial value `0`).

Fixed idea:

```js
function getTotalUsageMB(records) {
  return records.reduce((total, record) => total + record.dataUsageMB, 0);
}
```

Full write-up and demo: `/dashboard/fix-the-code`

---

## Quick checklist for reviewers

1. `nvm use` / Node 24
2. `cd back-end && npm install &&` copy `.env` && `npm run dev`
3. `cd front-end && npm install && npm run dev`
4. Open `http://localhost:5173` → login `admin` / `admin123`
5. (Optional) Import `postman-collection/postman.postman_collection.json` and smoke-test the APIs

Thanks for reviewing.
