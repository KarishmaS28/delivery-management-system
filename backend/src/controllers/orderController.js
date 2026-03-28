const { Op } = require('sequelize');
const sequelize = require('../connection/sequelize');
const { User, Order, Delivery } = require('../models');
const { error, success } = require('../common/res.common');
const { http_codes, messages, STATUS_TRANSITIONS, ORDER_STATUS, roles } = require('../constants/text.constant');


const ORDER_INCLUDE = [
  { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
  {
    model: Delivery, as: 'delivery', required: false,
    include: [{ model: User, as: 'driver', attributes: ['id', 'name', 'email'] }],
  },
];

const createOrder = async (req, res) => {
  const { pickup_address, delivery_address } = req.body;
  const transaction = req.context.sequelizeTransaction;

  try {
    const order = await Order.create({ customer_id: req.user.id, pickup_address, delivery_address }, { transaction });
    return success(http_codes.created, messages.success, order, res);
  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

const getOrders = async (req, res) => {
  const { status } = req.query;
  const { role, id } = req.user;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;


  try {
    const where = {};
    if (role === roles.customer) where.customer_id = id;
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: ORDER_INCLUDE,
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return success(http_codes.ok, messages.success, {
      orders: rows,
      pagination: { currentPage: page, limit, totalItems: count, totalPages: Math.ceil(count / limit) },
    }, res);
  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

const assignDriver = async (req, res) => {
  const { driverId, orderId } = req.body;

  const transaction = req.context.sequelizeTransaction;
  try {
    const order = await Order.findByPk(orderId, { transaction ,lock: transaction.LOCK.UPDATE });
    if (!order) {
      return error(http_codes.notFound, messages.orderNotFound, res);
    }
    if (order.status !== ORDER_STATUS.pending) {
      return error(http_codes.badRequest, messages.onlyPendingAssign, res);
    }

    const driver = await User.findOne({ where: { id: driverId, role: roles.driver }, transaction});
    if (!driver) {
      return error(http_codes.notFound, messages.driverNotFound, res);
    }

    await Delivery.upsert({ order_id: orderId, driver_id: driverId, assigned_at: new Date() }, { transaction });
    await order.update({ status: ORDER_STATUS.assigned }, { transaction });

    const updated = await Order.findByPk(orderId, { include: ORDER_INCLUDE,transaction });
    return success(http_codes.ok, messages.success, updated, res);
  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

const updateStatus = async (req, res) => {
  const { status, orderId } = req.body;

  const transaction = req.context.sequelizeTransaction;
  try {
    const delivery = await Delivery.findOne({
      where: { order_id: orderId, driver_id: req.user.id },
      transaction,
    });
    if (!delivery) {
      return error(http_codes.forbidden, messages.orderNotAssigned, res);
    }

    const order = await Order.findByPk(orderId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!order) {
      return error(http_codes.notFound, messages.orderNotFound, res);
    }

    const allowedNext = STATUS_TRANSITIONS[order.status];
    if (allowedNext !== status) {
      return error(http_codes.badRequest, `You cannot change the order status from "${order.status}" to "${status}".`, res);
    }

    await order.update({ status: status }, { transaction});

    const updated = await Order.findByPk(orderId, { include: ORDER_INCLUDE,transaction });
    return success(http_codes.ok, messages.success, updated, res);
  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

const getDriverOrders = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;
  const { status } = req.query;

  try {
    const orderWhere = {};
    if (status) orderWhere.status = status;

    const { count, rows } = await Delivery.findAndCountAll({
      where: { driver_id: req.user.id },
      include: [{
        model: Order, as: 'order',
        where: orderWhere,
        include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }],
      }],
      order: [['assigned_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return success(http_codes.ok, messages.success, {
      orders: rows.map((d) => ({ ...d.order.toJSON(), assigned_at: d.assigned_at })),
      pagination: { currentPage: page, limit, totalItems: count, totalPages: Math.ceil(count / limit) },
    }, res);
  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

const getDrivers = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const offset = (page - 1) * limit;
  const { search } = req.query;

  try {
    const where = { role: roles.driver };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
      limit,
      offset,
    });

    return success(http_codes.ok, messages.success, {
      drivers: rows,
      pagination: {
        currentPage: page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      },
    }, res);

  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

module.exports = { createOrder, getOrders, assignDriver, updateStatus, getDriverOrders, getDrivers };
