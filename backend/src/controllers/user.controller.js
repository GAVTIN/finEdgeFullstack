const { registerUser, loginUser } = require('../services/userService');

async function register(req, res, next) {
  try {
    const { name, email, password, monthlyBudget, savingsTarget } = req.body;
    const result = await registerUser({ name, email, password, monthlyBudget, savingsTarget });
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ status: 'fail', message: 'Email and password are required' });
    }
    const result = await loginUser({ email, password });
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
}

module.exports = { register, login, getMe };
