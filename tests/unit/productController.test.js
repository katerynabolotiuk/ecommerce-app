const { Product } = require('../../src/models');
const productController = require('../../src/controllers/productController');
const { mockDeep } = require('jest-mock-extended');

jest.mock('../../src/models');

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const fakeProduct = { id: 1, name: 'Item' };
      req.body = { name: 'Item' };
      Product.create.mockResolvedValue(fakeProduct);

      await productController.createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeProduct);
    });

    it('should handle errors', async () => {
      Product.create.mockRejectedValue(new Error('Invalid data'));
      req.body = {};

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid data' });
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const products = [{ id: 1 }];
      Product.findAll.mockResolvedValue(products);

      await productController.getAllProducts(req, res);

      expect(res.json).toHaveBeenCalledWith(products);
    });
  });

  describe('getProductById', () => {
    it('should return product if found', async () => {
      const product = { id: 1 };
      req.params = { id: 1 };
      Product.findByPk.mockResolvedValue(product);

      await productController.getProductById(req, res);

      expect(Product.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 1 };
      Product.findByPk.mockResolvedValue(null);

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });

  describe('updateProduct', () => {
    it('should update product if found', async () => {
      const product = mockDeep();
      product.update.mockResolvedValue({ id: 1, name: 'Updated' });
      req.params = { id: 1 };
      req.body = { name: 'Updated' };
      Product.findByPk.mockResolvedValue(product);

      await productController.updateProduct(req, res);

      expect(product.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Updated' });
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 1 };
      req.body = { name: 'Updated' };
      Product.findByPk.mockResolvedValue(null);

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product if found', async () => {
      const product = mockDeep();
      product.destroy.mockResolvedValue();
      req.params = { id: 1 };
      Product.findByPk.mockResolvedValue(product);

      await productController.deleteProduct(req, res);

      expect(product.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted' });
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 1 };
      Product.findByPk.mockResolvedValue(null);

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });
});