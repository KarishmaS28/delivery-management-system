const { DataTypes } = require('sequelize');
const sequelize = require('../connection/sequelize');
const { schemas } = require('../constants/text.constant');

const Delivery = sequelize.define(schemas.deliveries, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  driver_id: { type: DataTypes.INTEGER, allowNull: false },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: schemas.deliveries,
  timestamps: false,
  indexes: [
    { unique: true, fields: ['order_id'] },
    { fields: ['driver_id'] },
  ],
});

module.exports = Delivery;
