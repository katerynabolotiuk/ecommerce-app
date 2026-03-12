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

const createProduct = (price = 25.00) =>
  request(app).post('/api/products').send({ name: 'Product', price, stock: 100 });

const createOrder = (userId, items) =>
  request(app).post('/api/orders').send({ userId, items });

describe('POST /api/orders', () => {
  it('creates an order and returns 201', async () => {
    const user = await createUser();
    const product = await createProduct(10.00);

    const res = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 2 },
    ]);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('pending');
  });

  it('calculates total price correctly', async () => {
    const user = await createUser();
    const product1 = await createProduct(10.00);
    const product2 = await createProduct(20.00);

    const res = await createOrder(user.body.id, [
      { productId: product1.body.id, quantity: 2 },
      { productId: product2.body.id, quantity: 1 },
    ]);

    expect(res.status).toBe(201);
    expect(res.body.totalPrice).toBe('40.00');
  });

  it('returns order with nested items and products', async () => {
    const user = await createUser();
    const product = await createProduct(15.00);

    const res = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 3 },
    ]);

    expect(res.status).toBe(201);
    expect(res.body.OrderItems).toHaveLength(1);
    expect(res.body.OrderItems[0].quantity).toBe(3);
    expect(res.body.OrderItems[0].price).toBe('15.00');
    expect(res.body.OrderItems[0].Product.id).toBe(product.body.id);
  });

  it('returns 404 if a product does not exist', async () => {
    const user = await createUser();

    const res = await createOrder(user.body.id, [
      { productId: 99999, quantity: 1 },
    ]);

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('99999');
  });

  it('rolls back transaction if any product is invalid', async () => {
    const user = await createUser();
    const product = await createProduct();

    await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 1 },
      { productId: 99999, quantity: 1 },
    ]);

    const orders = await request(app).get('/api/orders');
    expect(orders.body).toHaveLength(0);
  });
});

describe('GET /api/orders', () => {
  it('returns empty array when no orders exist', async () => {
    const res = await request(app).get('/api/orders');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all orders with items and products', async () => {
    const user = await createUser();
    const product = await createProduct();

    await createOrder(user.body.id, [{ productId: product.body.id, quantity: 1 }]);
    await createOrder(user.body.id, [{ productId: product.body.id, quantity: 2 }]);

    const res = await request(app).get('/api/orders');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('OrderItems');
  });
});

describe('GET /api/orders/:id', () => {
  it('returns order by id with full details', async () => {
    const user = await createUser();
    const product = await createProduct(30.00);
    const created = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 1 },
    ]);

    const res = await request(app).get(`/api/orders/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(res.body.OrderItems).toHaveLength(1);
    expect(res.body.OrderItems[0].Product).toBeDefined();
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app).get('/api/orders/99999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Order not found');
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('updates order status', async () => {
    const user = await createUser();
    const product = await createProduct();
    const created = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 1 },
    ]);

    const res = await request(app)
      .patch(`/api/orders/${created.body.id}/status`)
      .send({ status: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('paid');
  });

  it('transitions through full order lifecycle', async () => {
    const user = await createUser();
    const product = await createProduct();
    const created = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 1 },
    ]);
    const id = created.body.id;

    await request(app).patch(`/api/orders/${id}/status`).send({ status: 'paid' });
    await request(app).patch(`/api/orders/${id}/status`).send({ status: 'shipped' });

    const res = await request(app).get(`/api/orders/${id}`);
    expect(res.body.status).toBe('shipped');
  });

  it('returns 400 for invalid status value', async () => {
    const user = await createUser();
    const product = await createProduct();
    const created = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 1 },
    ]);

    const res = await request(app)
      .patch(`/api/orders/${created.body.id}/status`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app)
      .patch('/api/orders/99999/status')
      .send({ status: 'paid' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/orders/:id', () => {
  it('deletes order and returns success message', async () => {
    const user = await createUser();
    const product = await createProduct();
    const created = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 1 },
    ]);

    const res = await request(app).delete(`/api/orders/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Order deleted');
  });

  it('cascade deletes order items', async () => {
    const user = await createUser();
    const product = await createProduct();
    const created = await createOrder(user.body.id, [
      { productId: product.body.id, quantity: 2 },
    ]);

    await request(app).delete(`/api/orders/${created.body.id}`);

    const res = await request(app).get(`/api/orders/${created.body.id}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app).delete('/api/orders/99999');

    expect(res.status).toBe(404);
  });
});