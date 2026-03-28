const router = require('express').Router();
const { register, login } = require('../controllers/authController');
const { registerRules, loginRules, validate } = require('../validators');
const transaction = require("../middleware/transaction");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: StrongPass!123
 *               role:
 *                 type: string
 *                 enum: [customer, driver, admin]
 *                 example: customer
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post('/register', registerRules, validate,transaction(true), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass!123
 *     responses:
 *       200:
 *         description: JWT token and user info returned
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginRules, validate, login);

module.exports = router;