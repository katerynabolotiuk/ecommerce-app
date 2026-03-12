const request = require('supertest');
const app = require('../../src/app');

const validUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  passwordHash: 'hash123',
};

const createUser = (overrides = {}) =>
  request(app).post('/api/users').send({ ...validUser, ...overrides });

describe('POST /api/users', () => {
  it('creates a user and returns 201', async () => {
    const res = await createUser();

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe('jane@example.com');
    expect(res.body.firstName).toBe('Jane');
  });

  it('normalizes email to lowercase', async () => {
    const res = await createUser({ email: 'JANE@EXAMPLE.COM' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('jane@example.com');
  });

  it('automatically creates a cart for the new user', async () => {
    const res = await createUser();

    const cartsRes = await request(app).get('/api/carts');
    const cart = cartsRes.body.find(c => c.userId === res.body.id);
    expect(cart).toBeDefined();
  });

  it('returns 400 for duplicate email', async () => {
    await createUser();
    const res = await createUser();

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for invalid email format', async () => {
    const res = await createUser({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/users').send({ firstName: 'Jane' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/users', () => {
  it('returns empty array when no users exist', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all users', async () => {
    await createUser();
    await createUser({ email: 'other@example.com' });

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/users/:id', () => {
  it('returns user by id', async () => {
    const created = await createUser();

    const res = await request(app).get(`/api/users/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(res.body.email).toBe('jane@example.com');
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/99999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });
});

describe('PUT /api/users/:id', () => {
  it('updates user fields', async () => {
    const created = await createUser();

    const res = await request(app)
      .put(`/api/users/${created.body.id}`)
      .send({ firstName: 'Updated', lastName: 'Name' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body.lastName).toBe('Name');
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app)
      .put('/api/users/99999')
      .send({ firstName: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/users/:id', () => {
  it('deletes user and returns success message', async () => {
    const created = await createUser();

    const res = await request(app).delete(`/api/users/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted');
  });

  it('cascade deletes the user cart', async () => {
    const created = await createUser();
    const userId = created.body.id;

    await request(app).delete(`/api/users/${userId}`);

    const cartsRes = await request(app).get('/api/carts');
    const cart = cartsRes.body.find(c => c.userId === userId);
    expect(cart).toBeUndefined();
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app).delete('/api/users/99999');

    expect(res.status).toBe(404);
  });
});