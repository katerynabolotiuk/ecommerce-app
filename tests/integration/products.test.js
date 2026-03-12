const request = require('supertest');
const app = require('../../src/app');

const validProduct = {
  name: 'Widget',
  description: 'A great widget',
  price: 29.99,
  stock: 100,
};

const createProduct = (overrides = {}) =>
  request(app).post('/api/products').send({ ...validProduct, ...overrides });

describe('POST /api/products', () => {
  it('creates a product and returns 201', async () => {
    const res = await createProduct();

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Widget');
    expect(res.body.price).toBe('29.99');
    expect(res.body.stock).toBe(100);
  });

  it('creates product without description', async () => {
    const res = await createProduct({ description: undefined });

    expect(res.status).toBe(201);
    expect(res.body.description).toBeNull();
  });

  it('defaults stock to 0 if not provided', async () => {
    const res = await createProduct({ stock: undefined });

    expect(res.status).toBe(201);
    expect(res.body.stock).toBe(0);
  });

  it('returns 400 when name is missing', async () => {
    const res = await createProduct({ name: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when price is missing', async () => {
    const res = await createProduct({ price: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/products', () => {
  it('returns empty array when no products exist', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all products', async () => {
    await createProduct();
    await createProduct({ name: 'Gadget' });

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/products/:id', () => {
  it('returns product by id', async () => {
    const created = await createProduct();

    const res = await request(app).get(`/api/products/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Widget');
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/99999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });
});

describe('PUT /api/products/:id', () => {
  it('updates product fields', async () => {
    const created = await createProduct();

    const res = await request(app)
      .put(`/api/products/${created.body.id}`)
      .send({ name: 'Updated Widget', price: 49.99 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Widget');
    expect(res.body.price).toBe(49.99);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app)
      .put('/api/products/99999')
      .send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  it('deletes product and returns success message', async () => {
    const created = await createProduct();

    const res = await request(app).delete(`/api/products/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted');
  });

  it('actually removes product from db', async () => {
    const created = await createProduct();
    await request(app).delete(`/api/products/${created.body.id}`);

    const res = await request(app).get(`/api/products/${created.body.id}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app).delete('/api/products/99999');

    expect(res.status).toBe(404);
  });
});