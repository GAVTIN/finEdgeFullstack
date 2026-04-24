/**
 * Custom request logger middleware.
 * Logs: timestamp, method, URL, status code, and response time.
 */
function logger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`;

    // Color-code by status
    if (res.statusCode >= 500) console.error('\x1b[31m%s\x1b[0m', log);       // red
    else if (res.statusCode >= 400) console.warn('\x1b[33m%s\x1b[0m', log);   // yellow
    else console.log('\x1b[32m%s\x1b[0m', log);                               // green
  });

  next();
}

module.exports = logger;
