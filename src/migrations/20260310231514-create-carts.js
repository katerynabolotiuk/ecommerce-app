'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Carts', {
      id: { 
        type: Sequelize.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      createdAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.fn('NOW') },
      updatedAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.fn('NOW') 
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Carts');
  }
};