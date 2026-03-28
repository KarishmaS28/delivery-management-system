const { DataTypes } = require('sequelize');
const sequelize = require('../connection/sequelize');
const { schemas } = require('../constants/text.constant');

const Order = sequelize.define(schemas.orders, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },//
  pickup_address: { type: DataTypes.TEXT, allowNull: false },
  delivery_address: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'picked', 'delivered'),//
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  tableName: schemas.orders,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['customer_id'] },
    { fields: ['status'] },
    { fields: ['customer_id', 'status'] },
  ],
});

module.exports = Order;
