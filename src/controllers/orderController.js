const { Order, OrderItem, Product, sequelize } = require('../models');

exports.createOrder = async (req, res) => {
    const { userId, items } = req.body;

    const t = await sequelize.transaction();

    try {
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(404).json({ error: `Product with id ${item.productId} not found` });
      }

      totalPrice += parseFloat(product.price) * item.quantity;
      item.price = product.price; 
    }

    const order = await Order.create(
      { userId, totalPrice, status: 'pending' },
      { transaction: t }
    );

    for (const item of items) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        },
        { transaction: t }
      );
    }

    await t.commit();

    const createdOrder = await Order.findByPk(order.id, {
      include: { model: OrderItem, include: Product }
    });
    res.status(201).json(createdOrder);

  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.findAll({
    include: { model: OrderItem, include: Product }
  });
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: { model: OrderItem, include: Product }
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  await order.destroy();
  res.json({ message: 'Order deleted' });
};