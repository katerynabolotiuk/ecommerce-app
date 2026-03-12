module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  });

  User.associate = models => {
    User.hasOne(models.Cart, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });

    User.hasMany(models.Order, {
      foreignKey: "userId"
    });
  };

  User.afterCreate(async (user, options) => {
    const { Cart } = sequelize.models;
    await Cart.create({ userId: user.id });
  });

  return User;
};