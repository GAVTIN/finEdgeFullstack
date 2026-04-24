const { CACHE_TTL_MS } = require('../config/env');

/**
 * Simple in-memory cache with TTL expiry.
 * Stored as Map<key, { value, expiresAt }>
 */
class CacheService {
  constructor() {
    this._store = new Map();
  }

  /**
   * Get a cached value. Returns null if missing or expired.
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Set a value with optional TTL (defaults to env CACHE_TTL_MS).
   */
  set(key, value, ttlMs = CACHE_TTL_MS) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Manually invalidate a key.
   */
  invalidate(key) {
    this._store.delete(key);
  }

  /**
   * Invalidate all keys that start with a prefix.
   */
  invalidatePrefix(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) this._store.delete(key);
    }
  }

  /**
   * Clear all cache entries.
   */
  flush() {
    this._store.clear();
  }
}

// Export singleton
module.exports = new CacheService();
