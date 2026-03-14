const { Order, OrderItem, Product, sequelize } = require('../../src/models');
const orderController = require('../../src/controllers/orderController');
const { mockDeep } = require('jest-mock-extended');

jest.mock('../../src/models');

describe('Order Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    jest.clearAllMocks();
  });

  it('should create an order', async () => {
    req.body = {
      userId: 1,
      items: [
        { productId: 10, quantity: 2 },
        { productId: 20, quantity: 1 }
      ]
    };
    const transaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };
    const product1 = { id: 10, price: '5.00' };
    const product2 = { id: 20, price: '10.00' };
    const order = { id: 100 };
    const createdOrder = {
      id: 100,
      userId: 1,
      totalPrice: 20
    };
    sequelize.transaction.mockResolvedValue(transaction);
    Product.findByPk
      .mockResolvedValueOnce(product1)
      .mockResolvedValueOnce(product2);
    Order.create.mockResolvedValue(order);
    OrderItem.create.mockResolvedValue({});
    Order.findByPk.mockResolvedValue(createdOrder);

    await orderController.createOrder(req, res);

    expect(Product.findByPk).toHaveBeenCalledTimes(3);
    expect(Order.create).toHaveBeenCalledWith(
      { userId: 1, totalPrice: 20, status: 'pending' },
      { transaction }
    );
    expect(OrderItem.create).toHaveBeenCalledTimes(3);
    expect(transaction.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdOrder);
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [{ id: 1 }];
      Order.findAll.mockResolvedValue(orders);

      await orderController.getAllOrders(req, res);

      expect(res.json).toHaveBeenCalledWith(orders);
    });
  });

  describe('getOrderById', () => {
    it('should return order if found', async () => {
      const order = { id: 1 };
      req.params = { id: 1 };
      Order.findByPk.mockResolvedValue(order);

      await orderController.getOrderById(req, res);

      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 1 };
      Order.findByPk.mockResolvedValue(null);

      await orderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
  });

  describe('deleteOrder', () => {
    it('should delete order', async () => {
      const order = mockDeep();
      req.params = { id: 1 };
      Order.findByPk.mockResolvedValue(order);

      await orderController.deleteOrder(req, res);

      expect(order.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Order deleted' });
    });

    it('should return 404 if order not found', async () => {
      req.params = { id: 1 };
      Order.findByPk.mockResolvedValue(null);

      await orderController.deleteOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
  });
});