const request = require('supertest');
const fs = require('fs/promises');
const path = require('path');
const app = require('../src/app');

const DATA_PATH = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_PATH, 'users.json');
const TX_FILE = path.join(DATA_PATH, 'transactions.json');

let token;
let txId;

beforeAll(async () => {
  await fs.mkdir(DATA_PATH, { recursive: true });
  await fs.writeFile(USERS_FILE, '[]', 'utf-8');
  await fs.writeFile(TX_FILE, '[]', 'utf-8');

  // Register and get token
  const res = await request(app).post('/users').send({
    name: 'Test User',
    email: 'txtest@finedge.dev',
    password: 'password123',
  });
  token = res.body.data.token;
});

afterAll(async () => {
  await fs.writeFile(USERS_FILE, '[]', 'utf-8');
  await fs.writeFile(TX_FILE, '[]', 'utf-8');
});

describe('POST /transactions', () => {
  it('should create an income transaction', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'income',
        category: 'salary',
        amount: 80000,
        description: 'Monthly salary',
        date: '2025-04-01T00:00:00.000Z',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.transaction).toHaveProperty('id');
    expect(res.body.data.transaction.amount).toBe(80000);
    txId = res.body.data.transaction.id;
  });

  it('should create an expense transaction', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'expense',
        category: 'food',
        amount: 5000,
        description: 'Groceries',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.transaction.type).toBe('expense');
  });

  it('should reject invalid type with 422', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'gift', category: 'food', amount: 100 });
    expect(res.statusCode).toBe(422);
  });

  it('should reject zero amount with 422', async () => {
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'expense', category: 'food', amount: 0 });
    expect(res.statusCode).toBe(422);
  });

  it('should reject unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({ type: 'income', category: 'salary', amount: 100 });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /transactions', () => {
  it('should return all transactions for the user', async () => {
    const res = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.transactions)).toBe(true);
    expect(res.body.results).toBeGreaterThan(0);
  });

  it('should filter by type=income', async () => {
    const res = await request(app)
      .get('/transactions?type=income')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    res.body.data.transactions.forEach((t) => expect(t.type).toBe('income'));
  });
});

describe('GET /transactions/:id', () => {
  it('should return a single transaction by id', async () => {
    const res = await request(app)
      .get(`/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.transaction.id).toBe(txId);
  });

  it('should return 404 for unknown id', async () => {
    const res = await request(app)
      .get('/transactions/non-existent-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('PATCH /transactions/:id', () => {
  it('should update a transaction amount', async () => {
    const res = await request(app)
      .patch(`/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 90000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.transaction.amount).toBe(90000);
  });
});

describe('DELETE /transactions/:id', () => {
  it('should delete a transaction', async () => {
    const res = await request(app)
      .delete(`/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should return 404 after deletion', async () => {
    const res = await request(app)
      .get(`/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
