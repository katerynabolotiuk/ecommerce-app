const {Sequelize} = require('sequelize')

async function up ({context: queryInterface}) {
  await queryInterface.createTable('Orders', {
    id: { 
      type: Sequelize.DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    status: {
      type: Sequelize.DataTypes.ENUM('pending', 'paid', 'shipped', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    totalPrice: { 
      type: Sequelize.DataTypes.DECIMAL(10,2), 
      allowNull: false, 
      defaultValue: 0 
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
  await queryInterface.dropTable('Orders');
};

module.exports = {up, down}