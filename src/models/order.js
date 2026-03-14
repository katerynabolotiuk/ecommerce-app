module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0
    }
  });

  Order.associate = models => {
    Order.belongsTo(models.User, {
      foreignKey: "userId"
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: "orderId",
      onDelete: "CASCADE"
    });
  };

  return Order;
};