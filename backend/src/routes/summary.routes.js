const express = require('express');
const { summary } = require('../controllers/summary.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, summary);

module.exports = router;
