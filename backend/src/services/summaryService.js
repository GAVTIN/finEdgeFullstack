const { readJSON } = require('../utils/fileStore');
const cache = require('./cacheService');

/**
 * Auto-categorize a transaction by matching keywords in description.
 */
function autoCategorize(description = '') {
  const desc = description.toLowerCase();
  const rules = [
    { keywords: ['salary', 'payroll', 'stipend'], category: 'salary' },
    { keywords: ['freelance', 'client', 'invoice'], category: 'freelance' },
    { keywords: ['dividend', 'interest', 'stock', 'mutual fund'], category: 'investment' },
    { keywords: ['uber', 'ola', 'metro', 'bus', 'fuel', 'petrol'], category: 'transport' },
    { keywords: ['zomato', 'swiggy', 'restaurant', 'food', 'cafe'], category: 'food' },
    { keywords: ['rent', 'pg', 'housing', 'landlord'], category: 'rent' },
    { keywords: ['electric', 'water', 'gas', 'broadband', 'wifi'], category: 'utilities' },
    { keywords: ['netflix', 'spotify', 'movie', 'game', 'amazon prime'], category: 'entertainment' },
    { keywords: ['doctor', 'hospital', 'pharmacy', 'medicine', 'clinic'], category: 'healthcare' },
    { keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'purchase'], category: 'shopping' },
  ];
  for (const { keywords, category } of rules) {
    if (keywords.some((kw) => desc.includes(kw))) return category;
  }
  return 'other';
}

/**
 * Compute savings tips based on spending patterns.
 */
function generateSavingsTips(byCategory, totalIncome, totalExpenses) {
  const tips = [];
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  if (savingsRate < 20) {
    tips.push('💡 Aim to save at least 20% of your income. You are currently below that threshold.');
  }
  if (byCategory.food > totalIncome * 0.15) {
    tips.push('🍔 Food spending exceeds 15% of income. Consider meal prepping to cut costs.');
  }
  if (byCategory.entertainment > totalIncome * 0.1) {
    tips.push('🎬 Entertainment spending is high. Review subscriptions — cancel unused ones.');
  }
  if (byCategory.shopping > totalIncome * 0.2) {
    tips.push('🛍️ Shopping is above 20% of income. Apply a 48-hour rule before purchases.');
  }
  if (tips.length === 0) {
    tips.push('✅ Great job! Your spending patterns look healthy. Keep it up.');
  }
  return tips;
}

/**
 * Compute monthly trend grouped by YYYY-MM.
 */
function computeMonthlyTrend(transactions) {
  const trend = {};
  for (const tx of transactions) {
    const month = tx.date.slice(0, 7); // 'YYYY-MM'
    if (!trend[month]) trend[month] = { income: 0, expense: 0 };
    if (tx.type === 'income') trend[month].income += tx.amount;
    else trend[month].expense += tx.amount;
  }
  // Convert to sorted array
  return Object.entries(trend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: parseFloat(data.income.toFixed(2)),
      expense: parseFloat(data.expense.toFixed(2)),
      balance: parseFloat((data.income - data.expense).toFixed(2)),
    }));
}

/**
 * Main summary computation (cached).
 */
async function getSummary(userId, filters = {}) {
  const cacheKey = `summary:${userId}:${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const allTransactions = await readJSON('transactions.json');
  let transactions = allTransactions.filter((t) => t.userId === userId);

  if (filters.startDate) {
    transactions = transactions.filter((t) => new Date(t.date) >= new Date(filters.startDate));
  }
  if (filters.endDate) {
    transactions = transactions.filter((t) => new Date(t.date) <= new Date(filters.endDate));
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  const byCategory = {};

  for (const tx of transactions) {
    if (tx.type === 'income') totalIncome += tx.amount;
    else totalExpenses += tx.amount;

    byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
  }

  // Round all category totals
  for (const cat in byCategory) {
    byCategory[cat] = parseFloat(byCategory[cat].toFixed(2));
  }

  const balance = parseFloat((totalIncome - totalExpenses).toFixed(2));
  const monthlyTrend = computeMonthlyTrend(transactions);
  const savingsTips = generateSavingsTips(byCategory, totalIncome, totalExpenses);

  const summary = {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    balance,
    byCategory,
    monthlyTrend,
    savingsTips,
    transactionCount: transactions.length,
    fromCache: false,
  };

  cache.set(cacheKey, summary);
  return summary;
}

module.exports = { getSummary, autoCategorize };
