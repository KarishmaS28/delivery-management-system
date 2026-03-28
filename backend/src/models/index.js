const User = require('./User');
const Order = require('./Order');
const Delivery = require('./Delivery');

// User (customer) has many Orders
User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Order has one Delivery
Order.hasOne(Delivery, { foreignKey: 'order_id', as: 'delivery' });
Delivery.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User (driver) has many Deliveries
User.hasMany(Delivery, { foreignKey: 'driver_id', as: 'deliveries' });
Delivery.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

module.exports = { User, Order, Delivery };
