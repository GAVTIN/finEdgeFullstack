const fs = require('fs/promises');
const path = require('path');
const { DATA_DIR } = require('../config/env');

const resolvePath = (filename) =>
  path.resolve(process.cwd(), DATA_DIR, filename);

/**
 * Read a JSON data file. Returns [] if file doesn't exist.
 */
async function readJSON(filename) {
  try {
    const raw = await fs.readFile(resolvePath(filename), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

/**
 * Write data array to a JSON file (pretty-printed).
 */
async function writeJSON(filename, data) {
  await fs.writeFile(resolvePath(filename), JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Ensure the data directory exists on startup.
 */
async function ensureDataDir() {
  await fs.mkdir(path.resolve(process.cwd(), DATA_DIR), { recursive: true });
}

module.exports = { readJSON, writeJSON, ensureDataDir };
