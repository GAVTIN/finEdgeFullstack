const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJSON, writeJSON } = require('../utils/fileStore');
const { createUser } = require('../models/User');
const AppError = require('../utils/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const FILE = 'users.json';

async function getAllUsers() {
  return readJSON(FILE);
}

async function findUserByEmail(email) {
  const users = await readJSON(FILE);
  return users.find((u) => u.email === email) || null;
}

async function findUserById(id) {
  const users = await readJSON(FILE);
  return users.find((u) => u.id === id) || null;
}

async function registerUser({ name, email, password, monthlyBudget, savingsTarget }) {
  const existing = await findUserByEmail(email);
  if (existing) throw new AppError('Email already registered', 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = createUser({ name, email, hashedPassword, monthlyBudget, savingsTarget });

  const users = await readJSON(FILE);
  users.push(user);
  await writeJSON(FILE, users);

  // Return user without password
  const { password: _pw, ...safeUser } = user;
  const token = signToken(user.id);
  return { user: safeUser, token };
}

async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const { password: _pw, ...safeUser } = user;
  const token = signToken(user.id);
  return { user: safeUser, token };
}

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  registerUser,
  loginUser,
  verifyToken,
};
