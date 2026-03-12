module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });

  Product.associate = models => {
    Product.hasMany(models.CartItem, {
      foreignKey: "productId",
      onDelete: "CASCADE"
    });

    Product.hasMany(models.OrderItem, {
      foreignKey: "productId"
    });
  };

  return Product;
};