require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { PORT } = require('./config/env');
const { ensureDataDir } = require('./utils/fileStore');

const logger       = require('./middlewares/logger.middleware');
const rateLimiter  = require('./middlewares/rateLimiter.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'FinEdge API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + 's',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
// Each require() call returns a FRESH router instance — avoids shared-state
// bugs when the same router is mounted at two paths simultaneously.
// Unprefixed  → used by Jest tests (supertest hits /users directly)
// /api prefix → used by React frontend via Vite proxy (/api/users → /users)
app.use('/users',            require('./routes/user.routes'));
app.use('/transactions',     require('./routes/transaction.routes'));
app.use('/summary',          require('./routes/summary.routes'));
app.use('/api/users',        require('./routes/user.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/summary',      require('./routes/summary.routes'));

// ── Serve React frontend in production ───────────────────────────────────────
const DIST = path.resolve(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(DIST));
  app.get(/^(?!\/api|\/health).*/, (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
async function start() {
  await ensureDataDir();
  app.listen(PORT, () => {
    const prod = process.env.NODE_ENV === 'production';
    console.log(`\n🚀 FinEdge API  →  http://localhost:${PORT}`);
    console.log(`📋 Health       →  http://localhost:${PORT}/health`);
    console.log(prod
      ? `🌐 React app   →  http://localhost:${PORT}\n`
      : `⚡ Dev frontend →  http://localhost:5173\n`
    );
  });
}

if (require.main === module) start();

module.exports = app;
