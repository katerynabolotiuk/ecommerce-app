const { Cart, CartItem, Product } = require('../../src/models');
const cartController = require('../../src/controllers/cartController');
const { mockDeep } = require('jest-mock-extended');

jest.mock('../../src/models');

describe('Cart Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('createCart', () => {
    it('should create a cart', async () => {
      req.body.userId = 1;
      const fakeCart = { id: 1, userId: 1 };
      Cart.create.mockResolvedValue(fakeCart);

      await cartController.createCart(req, res);

      expect(Cart.create).toHaveBeenCalledWith({ userId: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCart);
    });

    it('should handle error', async () => {
      Cart.create.mockRejectedValue(new Error('DB error'));
      req.body.userId = 1;

      await cartController.createCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getAllCarts', () => {
    it('should return all carts with items and products', async () => {
      const carts = [{ id: 1, CartItems: [] }];
      Cart.findAll.mockResolvedValue(carts);

      await cartController.getAllCarts(req, res);

      expect(Cart.findAll).toHaveBeenCalledWith({
        include: { model: CartItem, include: Product }
      });
      expect(res.json).toHaveBeenCalledWith(carts);
    });
  });

  describe('getCartById', () => {
    it('should return cart if found', async () => {
      req.params.id = 1;
      const cart = { id: 1, CartItems: [] };
      Cart.findByPk.mockResolvedValue(cart);

      await cartController.getCartById(req, res);

      expect(Cart.findByPk).toHaveBeenCalledWith(1, {
        include: { model: CartItem, include: Product }
      });
      expect(res.json).toHaveBeenCalledWith(cart);
    });

    it('should return 404 if not found', async () => {
      req.params.id = 1;
      Cart.findByPk.mockResolvedValue(null);

      await cartController.getCartById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart not found' });
    });
  });

  describe('addCartItem', () => {
    it('should add new cart item if not exists', async () => {
      req.params.id = 1;
      req.body = { productId: 2, quantity: 3 };

      Cart.findByPk.mockResolvedValue({ id: 1 });
      Product.findByPk.mockResolvedValue({ id: 2 });
      CartItem.findOne.mockResolvedValue(null);
      CartItem.create.mockResolvedValue({ id: 10, cartId: 1, productId: 2, quantity: 3 });

      await cartController.addCartItem(req, res);

      expect(Cart.findByPk).toHaveBeenCalledWith(1);
      expect(Product.findByPk).toHaveBeenCalledWith(2);
      expect(CartItem.create).toHaveBeenCalledWith({ cartId: 1, productId: 2, quantity: 3 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 10, cartId: 1, productId: 2, quantity: 3 });
    });

    it('should update quantity if cart item exists', async () => {
      req.params.id = 1;
      req.body = { productId: 2, quantity: 2 };

      Cart.findByPk.mockResolvedValue({ id: 1 });
      Product.findByPk.mockResolvedValue({ id: 2 });

      const cartItem = mockDeep();
      cartItem.quantity = 5;
      cartItem.save.mockResolvedValue({ id: 10, cartId: 1, productId: 2, quantity: 7 });
      CartItem.findOne.mockResolvedValue(cartItem);

      await cartController.addCartItem(req, res);

      expect(cartItem.quantity).toBe(7);
      expect(cartItem.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if cart not found', async () => {
      req.params.id = 1;
      req.body = { productId: 2, quantity: 2 };
      Cart.findByPk.mockResolvedValue(null);

      await cartController.addCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart not found' });
    });
  });

  describe('updateCartItem', () => {
    it('should update quantity if cart item found', async () => {
      req.params.cartId = 1;
      req.params.itemId = 10;
      req.body.quantity = 5;

      const item = mockDeep();
      item.update.mockResolvedValue({ id: 10, cartId: 1, quantity: 5 });
      CartItem.findOne.mockResolvedValue(item);

      await cartController.updateCartItem(req, res);

      expect(CartItem.findOne).toHaveBeenCalledWith({ where: { id: 10, cartId: 1 } });
      expect(item.update).toHaveBeenCalledWith({ quantity: 5 });
      expect(res.json).toHaveBeenCalledWith({ id: 10, cartId: 1, quantity: 5 });
    });

    it('should return 404 if cart item not found', async () => {
      req.params.cartId = 1;
      req.params.itemId = 10;
      CartItem.findOne.mockResolvedValue(null);

      await cartController.updateCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart item not found' });
    });
  });

  describe('deleteCart', () => {
    it('should delete cart if found', async () => {
      req.params.id = 1;
      const cart = mockDeep();
      cart.destroy.mockResolvedValue();
      Cart.findByPk.mockResolvedValue(cart);

      await cartController.deleteCart(req, res);

      expect(Cart.findByPk).toHaveBeenCalledWith(1);
      expect(cart.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart deleted' });
    });

    it('should return 404 if cart not found', async () => {
      req.params.id = 1;
      Cart.findByPk.mockResolvedValue(null);

      await cartController.deleteCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart not found' });
    });
  });
});