const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { error, success } = require('../common/res.common');
const { http_codes, messages } = require('../constants/text.constant');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const transaction = req.context.sequelizeTransaction;
  try {
    const existing = await User.findOne({ where: { email }, transaction });
    if (existing) return error(http_codes.Conflict, messages.userAlreadyExist, res);

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role }, { transaction });

    return success(http_codes.created, messages.success, {
      id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at,
    }, res);
  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return error(http_codes.unAuthorized, messages.invalidCredentials, res);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return error(http_codes.unAuthorized, messages.invalidCredentials, res);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return success(http_codes.ok, messages.success, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, res);
  } catch (err) {
    return error(http_codes.internalError, err.message, res);
  }
};

module.exports = { register, login };
