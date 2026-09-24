# Huawei Technical Test

Subscriber Usage API (Express) + Vue 3 frontend.

## Continue this project on another device

Before coding again on a new PC/laptop, do these steps in order.

### 1. Install required software

Install these first:

| Tool | Why | Check it works |
|------|-----|----------------|
| [Git](https://git-scm.com/) | Clone / pull the repo | `git --version` |
| **nvm** (Node Version Manager) | Install/switch Node versions safely | see below |
| Node.js via nvm (**v20+**, this project uses **v24**) | Run backend + frontend | `node -v` and `npm -v` |
| Code editor (Cursor / VS Code) | Edit code | — |
| [Postman](https://www.postman.com/downloads/) (optional) | Test API | — |

Do **not** install Node from nodejs.org if you use nvm — let nvm install Node for you. Mixing both often breaks PATH.

After installing Git/nvm, **close and reopen** the terminal so PATH updates.

### 1.1 Install nvm + Node

#### Windows (`nvm-windows`)

1. Uninstall any existing Node.js from Windows Settings (optional but recommended if PATH conflicts happen).
2. Download and install **nvm-windows**:  
   https://github.com/coreybutler/nvm-windows/releases  
   (use the latest `nvm-setup.exe`)
3. Open a **new** terminal (PowerShell or CMD as Admin if needed), then:

```powershell
nvm version
nvm install 24
nvm use 24
node -v
npm -v
```

Expected: Node around `v24.x.x`, and npm installed with it.

Useful commands:

```powershell
nvm list            # show installed Node versions
nvm install 20      # install another version if needed
nvm use 24          # switch active version for this terminal
```

#### macOS / Linux (`nvm`)

```bash
# install nvm (official curl script)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# restart terminal, then:
nvm install 24
nvm use 24
node -v
npm -v
```

Optional: this repo includes `.nvmrc` with `24`. On Mac/Linux you can run:

```bash
nvm use
```

On Windows nvm-windows, still run `nvm use 24` manually.

### 2. Get the project code

```bash
git clone https://github.com/diesalfatah/huawei-technical-test.git
cd huawei-technical-test
```

If the repo already exists on that device:

```bash
cd huawei-technical-test
git pull
```

### 3. Important: what is NOT in Git

These are ignored by `.gitignore`, so they will **not** appear after clone/pull:

| Missing locally | What to do |
|-----------------|------------|
| `back-end/.env` | Create it again (see step 4) |
| `docs/` (learning guide) | Copy manually from your old device, or re-download if you kept a backup. This folder is private/local only. |
| `node_modules/` | Reinstall with `npm install` |
| `back-end/snapshots/*.csv` | Generated later by Q2; folder can be empty |

### 4. Create backend environment file

Create file: `back-end/.env`

```env
PORT=3000
JWT_SECRET=paste-a-long-random-secret-here
JWT_EXPIRES_IN=8h
```

Generate a secret on the new device:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the output into `JWT_SECRET=...`.

Notes:
- Never commit `.env` to Git.
- Tokens from your old device will not work with a new secret. Login again after setup.
- You can copy `.env` from your old device via USB/password manager if you prefer the same secret.

Template file: `back-end/.env.example` (safe to commit; no real secret).

### 5. Install dependencies

Make sure the correct Node version is active first:

```bash
nvm use 24
node -v
```

Backend:

```bash
cd back-end
npm install
```

Frontend (new terminal — run `nvm use 24` again in that terminal on Windows):

```bash
cd front-end
npm install
```

### 6. Run the apps

**Terminal A — backend**

```bash
cd back-end
npm run dev
```

You should see something like: `Server running on port 3000`

**Terminal B — frontend**

```bash
cd front-end
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

Frontend `/api` requests are proxied to `http://localhost:3000` via `front-end/vite.config.js`.

### 7. Quick API smoke test (Postman or PowerShell)

1. Login:

`POST http://localhost:3000/api/auth/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

2. Copy `token` from the response.

3. Call usage with header:

`Authorization: Bearer <token>`

`GET http://localhost:3000/api/usage`

#### Demo accounts (from user seed)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin (can delete usage) |
| `operator` | `operator123` | operator |

PowerShell example (Windows):

```powershell
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

Invoke-RestMethod -Method Get `
  -Uri "http://localhost:3000/api/usage" `
  -Headers @{ Authorization = "Bearer $($login.token)" }
```

---

## Current progress checklist

Use this to know what is already done vs still todo.

### Backend
- [x] Q1 Usage CRUD API (`/api/usage`)
- [x] Auth login + JWT middleware (`/api/auth/login`, `/api/auth/me`)
- [x] Protect usage routes (admin-only delete)
- [ ] Q2 snapshot cron + CSV cleanup scripts (files exist, implement next)
- [ ] Q3 SQL answers + local SQLite practice
- [ ] Q4 bug explanation in docs/README

### Frontend
- [x] Vue 3 + Tailwind + Vue Router + Pinia scaffold
- [ ] Login page + auth store + router guard
- [ ] Usage list/create/edit/delete UI wired to API

Personal learning notes live in local `docs/GOLDEN-APP-FLOW.md` (not pushed to Git).

---

## Project structure (high level)

```text
huawei-technical-test/
├── back-end/          Express API (auth + usage)
├── front-end/         Vue 3 + Vite + Tailwind
├── docs/              Local learning notes only (gitignored)
└── README.md          This file
```

---

## Common setup problems

| Problem | Fix |
|---------|-----|
| `Cannot POST /api/login` | Use `/api/auth/login` (not `/api/login`) |
| `Invalid or expired token` | Login again; paste token only in Postman Bearer field (no extra `Bearer`) |
| `npm error Missing script: "dev"` | Run commands inside `back-end/` or `front-end/`, not repo root |
| Port 3000 already in use | Stop old Node process, or change `PORT` in `.env` |
| Frontend can't reach API | Start backend first; keep Vite proxy as `/api` → `localhost:3000` |
| Missing learning guide after clone | `docs/` is gitignored — copy it from your old device manually |
| `node` / `npm` not recognized | Install nvm, run `nvm use 24`, reopen terminal |
| Wrong Node version / weird install errors | Run `nvm use 24` before `npm install` |
| nvm and Node both installed from nodejs.org | Uninstall standalone Node; keep only nvm-managed Node |

---

## Useful commands

```bash
# Backend
cd back-end
npm install
npm run dev      # nodemon
npm start        # plain node

# Frontend
cd front-end
npm install
npm run dev
npm run build
```
