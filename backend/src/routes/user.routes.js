const express = require('express');
const { register, login, getMe } = require('../controllers/user.controller');
const { validateRegister } = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', validateRegister, register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
