const {Sequelize} = require('sequelize')

async function up ({context: queryInterface}) {
  await queryInterface.createTable('OrderItems', {
    id: { type: Sequelize.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' },
      onDelete: 'CASCADE'
    },
    productId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' }
    },
    quantity: { 
      type: Sequelize.DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 1,
      validate: {
        min: 1 
      } 
    },
    price: { 
      type: Sequelize.DataTypes.DECIMAL(10,2), 
      allowNull: false 
    },
    createdAt: { 
      allowNull: false, 
      type: Sequelize.DataTypes.DATE, 
      defaultValue: Sequelize.fn('NOW') 
    },
    updatedAt: { 
      allowNull: false, 
      type: Sequelize.DataTypes.DATE, 
      defaultValue: Sequelize.fn('NOW') 
    }
  });
};

async function down({context: queryInterface}) {
  await queryInterface.dropTable('OrderItems');
};

module.exports = {up, down}