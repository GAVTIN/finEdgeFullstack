const request = require('supertest');
const fs = require('fs/promises');
const path = require('path');
const app = require('../src/app');

const DATA_PATH = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_PATH, 'users.json');
const TX_FILE = path.join(DATA_PATH, 'transactions.json');

let token;

beforeAll(async () => {
  await fs.mkdir(DATA_PATH, { recursive: true });
  await fs.writeFile(USERS_FILE, '[]', 'utf-8');
  await fs.writeFile(TX_FILE, '[]', 'utf-8');

  const reg = await request(app).post('/users').send({
    name: 'Summary User',
    email: 'summary@finedge.dev',
    password: 'password123',
  });
  token = reg.body.data.token;

  // Seed some transactions
  const txns = [
    { type: 'income', category: 'salary', amount: 80000, date: '2025-04-01T00:00:00.000Z' },
    { type: 'expense', category: 'rent', amount: 15000, date: '2025-04-05T00:00:00.000Z' },
    { type: 'expense', category: 'food', amount: 8000, date: '2025-04-10T00:00:00.000Z' },
    { type: 'income', category: 'freelance', amount: 20000, date: '2025-05-01T00:00:00.000Z' },
  ];

  for (const tx of txns) {
    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(tx);
  }
});

afterAll(async () => {
  await fs.writeFile(USERS_FILE, '[]', 'utf-8');
  await fs.writeFile(TX_FILE, '[]', 'utf-8');
});

describe('GET /summary', () => {
  it('should return income, expense, balance, and byCategory', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('totalIncome');
    expect(res.body.data).toHaveProperty('totalExpenses');
    expect(res.body.data).toHaveProperty('balance');
    expect(res.body.data).toHaveProperty('byCategory');
    expect(res.body.data).toHaveProperty('monthlyTrend');
    expect(res.body.data).toHaveProperty('savingsTips');
    expect(res.body.data.totalIncome).toBe(100000);
    expect(res.body.data.totalExpenses).toBe(23000);
    expect(res.body.data.balance).toBe(77000);
  });

  it('should serve from cache on second request', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cached).toBe(true);
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/summary');
    expect(res.statusCode).toBe(401);
  });
});
