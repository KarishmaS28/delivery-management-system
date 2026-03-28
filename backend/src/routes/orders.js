const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  createOrder, getOrders, assignDriver,
  updateStatus, getDriverOrders, getDrivers,
} = require('../controllers/orderController');
const {
  orderRules, assignDriverRules, updateStatusRules,
  paginationRules, validate,
} = require('../validators');
const transaction = require("../middleware/transaction");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a delivery order (Customer only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickup_address, delivery_address]
 *             properties:
 *               pickup_address:
 *                 type: string
 *                 example: 123 Main St
 *               delivery_address:
 *                 type: string
 *                 example: 456 Elm St
 *     responses:
 *       201:
 *         description: Order created with pending status
 *       403:
 *         description: Access denied
 */
router.post('/', auth('customer'), orderRules, validate,transaction(true), createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders - Admin sees all, Customer sees own (paginated)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, assigned, picked, delivered]
 *     responses:
 *       200:
 *         description: Paginated list of orders
 *       403:
 *         description: Access denied
 */
router.get('/', auth('admin', 'customer'), paginationRules, validate, getOrders);

/**
 * @swagger
 * /api/orders/drivers:
 *   get:
 *     summary: Get all drivers (Admin only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search drivers by name or email
 *     responses:
 *       200:
 *         description: Paginated list of drivers
 *       403:
 *         description: Access denied
 */
router.get('/drivers', auth('admin'), paginationRules, validate, getDrivers);

/**
 * @swagger
 * /api/orders/me/orders:
 *   get:
 *     summary: Get orders assigned to the logged-in driver (paginated)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [assigned, picked, delivered]
 *     responses:
 *       200:
 *         description: Driver's assigned orders
 *       403:
 *         description: Access denied
 */
router.get('/me/orders', auth('driver'), paginationRules, validate, getDriverOrders);

/**
 * @swagger
 * /api/orders/assign:
 *   put:
 *     summary: Assign a driver to a pending order (Admin only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, driverId]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               driverId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Driver assigned, order status changed to assigned
 *       400:
 *         description: Order is not pending
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order or driver not found
 */
router.put('/assign', auth('admin'), assignDriverRules, validate, transaction(true),assignDriver);

/**
 * @swagger
 * /api/orders/status:
 *   put:
 *     summary: Update order status (Driver only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, status]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [picked, delivered]
 *                 example: picked
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Order not assigned to this driver
 *       404:
 *         description: Order not found
 */
router.put('/status', auth('driver'), updateStatusRules, validate, transaction(true),updateStatus);

module.exports = router;