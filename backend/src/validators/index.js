const { body, query, validationResult } = require('express-validator');
const { roles, ORDER_STATUS } = require('../constants/text.constant');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
 body('password')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/)
  .withMessage('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.'),
  body('role').isIn(Object.values(roles)).withMessage('Role must be customer, driver, or admin'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const orderRules = [
  body('pickup_address').trim().notEmpty().withMessage('Pickup address is required'),
  body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
];

const assignDriverRules = [
  body('driverId').isInt({ min: 1 }).withMessage('Valid driverId is required'),
  body('orderId').isInt({ min: 1 }).withMessage('Valid orderId is required'),

];

const updateStatusRules = [
  body('orderId').isInt({ min: 1 }).withMessage('Valid orderId is required'),
  body('status').isIn([ORDER_STATUS.picked, ORDER_STATUS.delivered]).withMessage('Invalid status value'),
];

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(Object.values(ORDER_STATUS)).withMessage('Invalid status filter'),
  query('search').optional().isString().trim().withMessage('Search must be a string'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  orderRules,
  assignDriverRules,
  updateStatusRules,
  paginationRules,
};
