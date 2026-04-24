const {
  getAllTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../services/transactionService');
const { autoCategorize } = require('../services/summaryService');

async function getAll(req, res, next) {
  try {
    const { category, type, startDate, endDate } = req.query;
    const transactions = await getAllTransactions(req.user.id, {
      category,
      type,
      startDate,
      endDate,
    });
    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions },
    });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const transaction = await getTransactionById(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { type, amount, description, date } = req.body;

    // Auto-categorize if category not provided
    let { category } = req.body;
    if (!category && description) {
      category = autoCategorize(description);
    }

    const transaction = await addTransaction(req.user.id, {
      type,
      category,
      amount,
      description,
      date,
    });

    res.status(201).json({
      status: 'success',
      message: 'Transaction added',
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const transaction = await updateTransaction(req.params.id, req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Transaction updated',
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await deleteTransaction(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Transaction deleted',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
