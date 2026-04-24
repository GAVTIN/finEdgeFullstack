const AppError = require('../utils/AppError');
const { VALID_CATEGORIES, VALID_TYPES } = require('../models/Transaction');

/**
 * Validates transaction inputs on POST /transactions.
 */
function validateTransaction(req, res, next) {
  const { type, category, amount, date } = req.body;
  const errors = [];

  if (!type) {
    errors.push('type is required');
  } else if (!VALID_TYPES.includes(type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (!category) {
    errors.push('category is required');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    errors.push('amount must be a positive number');
  }

  if (date && isNaN(new Date(date).getTime())) {
    errors.push('date must be a valid ISO date string');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation failed: ${errors.join('; ')}`, 422));
  }

  next();
}

/**
 * Validates user registration inputs on POST /users.
 */
function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push('name must be at least 2 characters');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('valid email is required');
  if (!password || password.length < 6) errors.push('password must be at least 6 characters');

  if (errors.length > 0) {
    return next(new AppError(`Validation failed: ${errors.join('; ')}`, 422));
  }

  next();
}

module.exports = { validateTransaction, validateRegister };
