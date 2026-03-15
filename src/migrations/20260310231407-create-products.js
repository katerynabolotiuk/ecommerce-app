const {Sequelize} = require('sequelize')

async function up ({context: queryInterface}) {
  await queryInterface.createTable('Products', {
    id: { 
      type: Sequelize.DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    name: { 
      type: Sequelize.DataTypes.STRING(200), 
      allowNull: false 
    },
    description: { 
      type: Sequelize.DataTypes.TEXT 
    },
    price: { 
      type: Sequelize.DataTypes.DECIMAL(10,2), 
      allowNull: false 
    },
    stock: { 
      type: Sequelize.DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0 
    },
    createdAt: { 
      allowNull: false, type: 
      Sequelize.DataTypes.DATE, 
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
  await queryInterface.dropTable('Products');
};

module.exports = {up, down}