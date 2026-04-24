# FinEdge — Personal Finance Tracker

> Full-stack personal finance web app. Track income and expenses, visualise spending patterns, and get automated savings advice. Built with **Node.js + Express** on the backend and **React 18 + Redux Toolkit** on the frontend.

---

## Quick Start (3 commands)

```bash
git clone https://github.com/<your-username>/finedge.git
cd finedge
bash setup.sh
```

After setup completes, open `backend/.env` and set a strong `JWT_SECRET`, then:

```bash
# Production — single URL, single port
cd backend && NODE_ENV=production npm start
# → http://localhost:3000
```

---

## Repository Structure

```
finedge/
├── backend/               ← Node.js + Express REST API
│   ├── src/
│   │   ├── config/        ← env.js — centralised dotenv config
│   │   ├── controllers/   ← thin request handlers
│   │   ├── middlewares/   ← auth, logger, validator, rateLimiter, errorHandler
│   │   ├── models/        ← User and Transaction factory functions
│   │   ├── routes/        ← modular Express routers
│   │   ├── services/      ← business logic (user, transaction, summary, cache)
│   │   ├── utils/         ← AppError.js, fileStore.js
│   │   └── app.js         ← Express app + server boot
│   ├── data/
│   │   ├── users.json         ← persisted users (auto-created)
│   │   └── transactions.json  ← persisted transactions (auto-created)
│   ├── tests/             ← Jest + Supertest (28 tests)
│   ├── .env.example       ← copy to .env and fill in JWT_SECRET
│   └── package.json
├── frontend/              ← React 18 + Vite SPA
│   ├── src/
│   │   ├── app/           ← Redux store
│   │   ├── features/auth/ ← authSlice + PrivateRoute
│   │   ├── services/      ← RTK Query API slice (all endpoints)
│   │   ├── components/    ← Navbar, StatCard, Charts, Modal, TransactionRow
│   │   ├── pages/         ← Login, Register, Dashboard, Transactions
│   │   ├── App.jsx        ← route tree
│   │   └── main.jsx       ← entry point
│   ├── index.html
│   ├── vite.config.js     ← dev proxy: /api → :3000
│   ├── tailwind.config.js
│   └── package.json
├── setup.sh               ← first-time setup script
├── .env.example           ← environment variable template
├── .gitignore
└── package.json           ← root scripts (install:all, build, start, test)
```

---

## Running Locally

### Option A — Production mode (single port, one terminal)

Everything runs on `http://localhost:3000`. Express serves both the API and the built React app.

```bash
# First time only
bash setup.sh

# Every time after
cd backend && NODE_ENV=production npm start
```

### Option B — Development mode (two terminals, hot reload)

The React dev server (Vite) runs on port 5173 and proxies all `/api/*` requests to Express on port 3000 — no CORS configuration needed.

```bash
# Terminal 1 — backend with nodemon hot reload
cd backend && npm run dev

# Terminal 2 — frontend with Vite HMR
cd frontend && npm run dev
# → Open http://localhost:5173
```

### Manual setup (if you prefer not to run setup.sh)

```bash
# 1. Install all dependencies
cd backend  && npm install
cd ../frontend && npm install

# 2. Create and configure .env
cp .env.example backend/.env
# Open backend/.env — set JWT_SECRET to any long random string

# 3. Ensure data files exist
mkdir -p backend/data
echo "[]" > backend/data/users.json
echo "[]" > backend/data/transactions.json

# 4. Build frontend (required for production mode)
cd frontend && npm run build

# 5. Start
cd ../backend && NODE_ENV=production npm start
```

---

## Environment Variables

All variables live in `backend/.env`. Use `backend/.env.example` as your template.

| Variable | Default | Required | Description |
|---|---|---|---|
| `PORT` | `3000` | No | Port Express listens on |
| `JWT_SECRET` | — | **Yes** | Secret for signing JWTs. Must be a long random string. |
| `JWT_EXPIRES_IN` | `7d` | No | Token expiry (`7d`, `24h`, `3600`, etc.) |
| `CACHE_TTL_MS` | `60000` | No | How long `/summary` is cached (milliseconds) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | No | Rate limiter window (milliseconds) |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | No | Max requests per IP per window |
| `DATA_DIR` | `./data` | No | Directory for JSON persistence files |

> **Tip:** Generate a strong JWT_SECRET with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## API Reference

Base URL: `http://localhost:3000`
All protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Server status + uptime |
| POST | `/api/users` | No | Register — returns JWT + user |
| POST | `/api/users/login` | No | Login — returns JWT + user |
| GET | `/api/users/me` | Yes | Current user profile |

### Transactions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/transactions` | Yes | Add income or expense |
| GET | `/api/transactions` | Yes | List all (filter: type, category, startDate, endDate) |
| GET | `/api/transactions/:id` | Yes | Single transaction |
| PATCH | `/api/transactions/:id` | Yes | Update fields |
| DELETE | `/api/transactions/:id` | Yes | Delete |

### Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/summary` | Yes | Income · Expenses · Balance · byCategory · monthlyTrend · savingsTips |

---

## Testing

```bash
cd backend && npm test
```

28 tests across 5 files — all passing.

| File | Tests | Covers |
|---|---|---|
| `health.test.js` | 2 | `/health` 200, 404 for unknown routes |
| `users.test.js` | 6 | Register, duplicate 409, validation 422, login, wrong password 401 |
| `transactions.test.js` | 12 | Full CRUD, auth guard, invalid input, filters, 404 after delete |
| `summary.test.js` | 3 | Correct totals, cache hit on 2nd request, auth guard |
| `cache.test.js` | 5 | Set/get, TTL expiry, prefix invalidation, flush |

---

## Deployment

### Render (recommended for free hosting)

1. Push this repository to GitHub (public)
2. Go to [render.com](https://render.com) → New Web Service → connect your repo
3. Configure:
   - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command:** `cd backend && NODE_ENV=production node src/app.js`
4. Add environment variables in the Render dashboard:
   - `JWT_SECRET` → your long random string
   - `NODE_ENV` → `production`
   - `PORT` → `3000`
5. Deploy → your app is live at `https://your-app.onrender.com`

### Railway

```bash
npm install -g @railway/cli
railway login
railway init          # inside the finedge repo
railway up
```

Add a `railway.toml` at the repo root:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd frontend && npm ci && npm run build && cd ../backend && npm ci && NODE_ENV=production node src/app.js"
```

Set env vars via `railway variables set JWT_SECRET=<secret> NODE_ENV=production`.

---

## Tech Stack

**Backend:** Node.js · Express.js · JWT (jsonwebtoken) · bcryptjs · fs/promises · dotenv · uuid · Jest · Supertest

**Frontend:** React 18 · Vite · Redux Toolkit · RTK Query · React Router v6 · React Hook Form · Recharts · Tailwind CSS · date-fns

---

## Author

**Gaurav Sinha** — Senior Frontend Engineer & Tech Lead
Airtribe AI-First Backend Developer Course, Cohort 19

Twitter: [@TheDevWhoShips](https://twitter.com/TheDevWhoShips)
