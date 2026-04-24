/**
 * Global error-handling middleware.
 * Must be registered last in Express with 4 parameters.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Log non-operational (unexpected) errors fully
  if (!err.isOperational) {
    console.error('💥 UNEXPECTED ERROR:', err);
  }

  res.status(statusCode).json({
    status,
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
