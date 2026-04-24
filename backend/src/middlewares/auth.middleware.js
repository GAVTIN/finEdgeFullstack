const AppError = require('../utils/AppError');
const { verifyToken, findUserById } = require('../services/userService');

/**
 * Protect routes — validates Bearer JWT and attaches req.user.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Provide a Bearer token.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await findUserById(decoded.id);
    if (!user) return next(new AppError('User no longer exists', 401));

    // Attach user (without password) to request
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401));
    }
    next(err);
  }
}

module.exports = { protect };
