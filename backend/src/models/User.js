const { DataTypes } = require('sequelize');
const sequelize = require('../connection/sequelize');
const { schemas } = require('../constants/text.constant');

const User = sequelize.define(schemas.users, {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },//
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('customer', 'driver', 'admin'),//
    allowNull: false,
  },
}, {
  tableName: schemas.users,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['role'] },
  ],
});

module.exports = User;
