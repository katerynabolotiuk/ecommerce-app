const {Sequelize} = require('sequelize')

async function up ({context: queryInterface}) {
  await queryInterface.createTable('Carts', {
    id: { 
      type: Sequelize.DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE'
    },
    createdAt: { 
      allowNull: false, 
      type: Sequelize.DataTypes.DATE, 
      defaultValue: Sequelize.fn('NOW') },
    updatedAt: { 
      allowNull: false, 
      type: Sequelize.DataTypes.DATE, 
      defaultValue: Sequelize.fn('NOW') 
    }
  });
};

async function down({context: queryInterface}) {
  await queryInterface.dropTable('Carts');
};

module.exports = {up, down}