/**
 * Transaction model shape (stored in transactions.json)
 * {
 *   id: string (uuid),
 *   userId: string,
 *   type: 'income' | 'expense',
 *   category: string,
 *   amount: number,
 *   description: string,
 *   date: ISO string,
 *   createdAt: ISO string
 * }
 */

const { v4: uuidv4 } = require('uuid');

const VALID_CATEGORIES = [
  'salary', 'freelance', 'investment', 'bonus',        // income
  'food', 'rent', 'transport', 'utilities',             // expense
  'entertainment', 'healthcare', 'shopping', 'other',   // expense
];

const VALID_TYPES = ['income', 'expense'];

function createTransaction({ userId, type, category, amount, description = '', date }) {
  return {
    id: uuidv4(),
    userId,
    type,
    category,
    amount: parseFloat(amount),
    description,
    date: date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createTransaction, VALID_CATEGORIES, VALID_TYPES };
