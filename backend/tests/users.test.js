const request = require('supertest');
const fs = require('fs/promises');
const path = require('path');
const app = require('../src/app');

const DATA_PATH = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_PATH, 'users.json');

// Clean up test data before/after
beforeAll(async () => {
  await fs.mkdir(DATA_PATH, { recursive: true });
  await fs.writeFile(USERS_FILE, '[]', 'utf-8');
});

afterAll(async () => {
  await fs.writeFile(USERS_FILE, '[]', 'utf-8');
});

describe('POST /users — Register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app).post('/users').send({
      name: 'Gaurav Sinha',
      email: 'gaurav@finedge.dev',
      password: 'secret123',
      monthlyBudget: 50000,
      savingsTarget: 10000,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data.user.email).toBe('gaurav@finedge.dev');
  });

  it('should reject duplicate email with 409', async () => {
    const res = await request(app).post('/users').send({
      name: 'Gaurav Sinha',
      email: 'gaurav@finedge.dev',
      password: 'secret123',
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.status).toBe('fail');
  });

  it('should reject missing fields with 422', async () => {
    const res = await request(app).post('/users').send({ name: 'NoEmail' });
    expect(res.statusCode).toBe(422);
  });

  it('should reject short password with 422', async () => {
    const res = await request(app).post('/users').send({
      name: 'Test User',
      email: 'test@finedge.dev',
      password: '123',
    });
    expect(res.statusCode).toBe(422);
  });
});

describe('POST /users/login', () => {
  it('should login and return a token', async () => {
    const res = await request(app).post('/users/login').send({
      email: 'gaurav@finedge.dev',
      password: 'secret123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject wrong password with 401', async () => {
    const res = await request(app).post('/users/login').send({
      email: 'gaurav@finedge.dev',
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(401);
  });
});
