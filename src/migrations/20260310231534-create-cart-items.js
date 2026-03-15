const {Sequelize} = require('sequelize')

async function up ({context: queryInterface}) {
  await queryInterface.createTable('CartItems', {
    id: { type: Sequelize.DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    cartId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Carts', key: 'id' },
      onDelete: 'CASCADE'
    },
    productId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' },
      onDelete: 'CASCADE'
    },
    quantity: { 
      type: Sequelize.DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 1 
    },
    createdAt: { 
      allowNull: false, 
      type: Sequelize.DataTypes.DATE, 
      defaultValue: Sequelize.fn('NOW') 
    },
    updatedAt: { allowNull: false, 
      type: Sequelize.DataTypes.DATE, 
      defaultValue: Sequelize.fn('NOW') 
    }
  });
};

async function down({context: queryInterface}) {
  await queryInterface.dropTable('CartItems');
};

module.exports = {up, down}