const express = require('express');
const {
  getAll,
  getOne,
  create,
  update,
  remove,
} = require('../controllers/transaction.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateTransaction } = require('../middlewares/validate.middleware');

const router = express.Router();

// All transaction routes require authentication
router.use(protect);

router.get('/', getAll);
router.post('/', validateTransaction, create);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
