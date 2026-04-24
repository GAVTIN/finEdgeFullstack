#!/usr/bin/env bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     FinEdge — First-time Setup       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Check Node version ───────────────────────────────────────────────────
NODE_VER=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 18 ]; then
  echo "❌  Node.js 18 or higher is required. Install from https://nodejs.org"
  exit 1
fi
echo "✅  Node.js $(node -v) detected"

# ── 2. Create backend/.env if missing ──────────────────────────────────────
if [ ! -f backend/.env ]; then
  cp .env.example backend/.env
  echo "📄  Created backend/.env from .env.example"
  echo "⚠️   Open backend/.env and set a strong JWT_SECRET before running."
else
  echo "✅  backend/.env already exists"
fi

# ── 3. Ensure data files exist ─────────────────────────────────────────────
mkdir -p backend/data
[ ! -f backend/data/users.json ]       && echo "[]" > backend/data/users.json
[ ! -f backend/data/transactions.json ] && echo "[]" > backend/data/transactions.json
echo "✅  Data directory ready"

# ── 4. Install dependencies ────────────────────────────────────────────────
echo ""
echo "📦  Installing backend dependencies..."
(cd backend && npm install)

echo "📦  Installing frontend dependencies..."
(cd frontend && npm install)

# ── 5. Build frontend ──────────────────────────────────────────────────────
echo ""
echo "🔨  Building React frontend..."
(cd frontend && npm run build)

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅  Setup complete!                                     ║"
echo "║                                                          ║"
echo "║  Production (single port):                               ║"
echo "║    cd backend && NODE_ENV=production npm start           ║"
echo "║    → http://localhost:3000                               ║"
echo "║                                                          ║"
echo "║  Development (two terminals):                            ║"
echo "║    Terminal 1: cd backend && npm run dev                 ║"
echo "║    Terminal 2: cd frontend && npm run dev                ║"
echo "║    → http://localhost:5173                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
