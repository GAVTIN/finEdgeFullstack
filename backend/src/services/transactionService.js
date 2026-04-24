const { readJSON, writeJSON } = require('../utils/fileStore');
const { createTransaction } = require('../models/Transaction');
const AppError = require('../utils/AppError');
const cache = require('./cacheService');

const FILE = 'transactions.json';

async function getAllTransactions(userId, filters = {}) {
  let transactions = await readJSON(FILE);

  // Filter to current user
  transactions = transactions.filter((t) => t.userId === userId);

  // Optional filters: category, type, startDate, endDate
  if (filters.category) {
    transactions = transactions.filter((t) => t.category === filters.category);
  }
  if (filters.type) {
    transactions = transactions.filter((t) => t.type === filters.type);
  }
  if (filters.startDate) {
    transactions = transactions.filter((t) => new Date(t.date) >= new Date(filters.startDate));
  }
  if (filters.endDate) {
    transactions = transactions.filter((t) => new Date(t.date) <= new Date(filters.endDate));
  }

  return transactions;
}

async function getTransactionById(id, userId) {
  const transactions = await readJSON(FILE);
  const tx = transactions.find((t) => t.id === id);
  if (!tx) throw new AppError('Transaction not found', 404);
  if (tx.userId !== userId) throw new AppError('Unauthorized', 403);
  return tx;
}

async function addTransaction(userId, data) {
  const transaction = createTransaction({ userId, ...data });
  const transactions = await readJSON(FILE);
  transactions.push(transaction);
  await writeJSON(FILE, transactions);

  // Invalidate summary cache for this user
  cache.invalidatePrefix(`summary:${userId}`);
  return transaction;
}

async function updateTransaction(id, userId, updates) {
  const transactions = await readJSON(FILE);
  const idx = transactions.findIndex((t) => t.id === id);

  if (idx === -1) throw new AppError('Transaction not found', 404);
  if (transactions[idx].userId !== userId) throw new AppError('Unauthorized', 403);

  // Only allow updating these fields
  const allowed = ['type', 'category', 'amount', 'description', 'date'];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) {
      transactions[idx][field] = field === 'amount'
        ? parseFloat(updates[field])
        : updates[field];
    }
  });

  await writeJSON(FILE, transactions);
  cache.invalidatePrefix(`summary:${userId}`);
  return transactions[idx];
}

async function deleteTransaction(id, userId) {
  const transactions = await readJSON(FILE);
  const idx = transactions.findIndex((t) => t.id === id);

  if (idx === -1) throw new AppError('Transaction not found', 404);
  if (transactions[idx].userId !== userId) throw new AppError('Unauthorized', 403);

  transactions.splice(idx, 1);
  await writeJSON(FILE, transactions);
  cache.invalidatePrefix(`summary:${userId}`);
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
