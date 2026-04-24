/**
 * User model shape (stored in users.json)
 * {
 *   id: string (uuid),
 *   name: string,
 *   email: string,
 *   password: string (bcrypt hashed),
 *   monthlyBudget: number,
 *   savingsTarget: number,
 *   createdAt: ISO string
 * }
 */

const { v4: uuidv4 } = require('uuid');

function createUser({ name, email, hashedPassword, monthlyBudget = 0, savingsTarget = 0 }) {
  return {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    monthlyBudget,
    savingsTarget,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createUser };
