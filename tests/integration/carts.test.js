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

const createProduct = (overrides = {}) =>
  request(app).post('/api/products').send({ name: 'Widget', price: 10.00, stock: 50, ...overrides });

const getUserCart = async (userId) => {
  const res = await request(app).get('/api/carts');
  return res.body.find(c => c.userId === userId);
};

describe('GET /api/carts', () => {
  it('returns empty array when no carts exist', async () => {
    const res = await request(app).get('/api/carts');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all carts with nested CartItems', async () => {
    await createUser();

    const res = await request(app).get('/api/carts');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('CartItems');
  });
});

describe('GET /api/carts/:id', () => {
  it('returns cart with items by id', async () => {
    const user = await createUser();
    const cart = await getUserCart(user.body.id);

    const res = await request(app).get(`/api/carts/${cart.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(cart.id);
    expect(res.body).toHaveProperty('CartItems');
  });

  it('returns 404 for non-existent cart', async () => {
    const res = await request(app).get('/api/carts/99999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cart not found');
  });
});

describe('POST /api/carts/:id/items', () => {
  it('adds a new item to the cart', async () => {
    const user = await createUser();
    const product = await createProduct();
    const cart = await getUserCart(user.body.id);

    const res = await request(app)
      .post(`/api/carts/${cart.id}/items`)
      .send({ productId: product.body.id, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.productId).toBe(product.body.id);
    expect(res.body.quantity).toBe(2);
  });

  it('accumulates quantity when adding the same product again', async () => {
    const user = await createUser();
    const product = await createProduct();
    const cart = await getUserCart(user.body.id);

    await request(app)
      .post(`/api/carts/${cart.id}/items`)
      .send({ productId: product.body.id, quantity: 2 });

    const res = await request(app)
      .post(`/api/carts/${cart.id}/items`)
      .send({ productId: product.body.id, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(5);
  });

  it('returns 404 for non-existent cart', async () => {
    const product = await createProduct();

    const res = await request(app)
      .post('/api/carts/99999/items')
      .send({ productId: product.body.id, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cart not found');
  });

  it('returns 404 for non-existent product', async () => {
    const user = await createUser();
    const cart = await getUserCart(user.body.id);

    const res = await request(app)
      .post(`/api/carts/${cart.id}/items`)
      .send({ productId: 99999, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });
});

describe('PUT /api/carts/:cartId/items/:itemId', () => {
  it('updates cart item quantity', async () => {
    const user = await createUser();
    const product = await createProduct();
    const cart = await getUserCart(user.body.id);

    const item = await request(app)
      .post(`/api/carts/${cart.id}/items`)
      .send({ productId: product.body.id, quantity: 1 });

    const res = await request(app)
      .put(`/api/carts/${cart.id}/items/${item.body.id}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(10);
  });

  it('returns 404 for non-existent item', async () => {
    const user = await createUser();
    const cart = await getUserCart(user.body.id);

    const res = await request(app)
      .put(`/api/carts/${cart.id}/items/99999`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cart item not found');
  });
});

describe('DELETE /api/carts/:id', () => {
  it('deletes cart and returns success message', async () => {
    const user = await createUser();
    const cart = await getUserCart(user.body.id);

    const res = await request(app).delete(`/api/carts/${cart.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Cart deleted');
  });

  it('cascade deletes cart items', async () => {
    const user = await createUser();
    const product = await createProduct();
    const cart = await getUserCart(user.body.id);

    await request(app)
      .post(`/api/carts/${cart.id}/items`)
      .send({ productId: product.body.id, quantity: 1 });

    await request(app).delete(`/api/carts/${cart.id}`);

    const res = await request(app).get(`/api/carts/${cart.id}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent cart', async () => {
    const res = await request(app).delete('/api/carts/99999');

    expect(res.status).toBe(404);
  });
});