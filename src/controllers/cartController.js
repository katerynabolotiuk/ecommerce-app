const { Cart, CartItem, Product } = require('../models');

exports.createCart = async (req, res) => {
  try {
    const cart = await Cart.create({ userId: req.body.userId });
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllCarts = async (req, res) => {
  const carts = await Cart.findAll({
    include: { model: CartItem, include: Product }
  });
  res.json(carts);
};

exports.getCartById = async (req, res) => {
  const cart = await Cart.findByPk(req.params.id, {
    include: { model: CartItem, include: Product }
  });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  res.json(cart);
};

exports.addCartItem = async (req, res) => {
  try {
    const { id: cartId } = req.params;
    const { productId, quantity } = req.body;

    const cart = await Cart.findByPk(cartId);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let cartItem = await CartItem.findOne({ where: { cartId, productId } });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ cartId, productId, quantity });
    }

    res.status(200).json(cartItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const item = await CartItem.findOne({
    where: { id: req.params.itemId, cartId: req.params.cartId }
  });
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  const updatedItem = await item.update({ quantity: req.body.quantity });

  res.json(updatedItem);
};

exports.deleteCart = async (req, res) => {
  const cart = await Cart.findByPk(req.params.id);
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  await cart.destroy();
  res.json({ message: 'Cart deleted' });
};