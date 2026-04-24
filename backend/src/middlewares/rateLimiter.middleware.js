const AppError = require('../utils/AppError');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('../config/env');

/**
 * Simple in-memory rate limiter.
 * Tracks requests per IP within a sliding window.
 */
const requestCounts = new Map(); // ip → { count, windowStart }

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Start fresh window
    requestCounts.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.windowStart)) / 1000);
    res.set('Retry-After', retryAfter);
    return next(new AppError(`Too many requests. Retry after ${retryAfter}s.`, 429));
  }

  record.count += 1;
  next();
}

module.exports = rateLimiter;
