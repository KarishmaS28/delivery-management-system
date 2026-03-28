'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE',
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  await queryInterface.addIndex('deliveries', ['order_id'], {
      name: 'idx_deliveries_order_id',
      unique: true,
    });

    await queryInterface.addIndex('deliveries', ['driver_id'], {
      name: 'idx_deliveries_driver_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('deliveries');
  },
};
