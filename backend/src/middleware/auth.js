const jwt = require('jsonwebtoken');
const { http_codes, messages } = require('../constants/text.constant');
const { error } = require('../common/res.common');

const auth = (...roles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return error(http_codes.unAuthorized, messages.tokenNotProvided, res);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return error(http_codes.unAuthorized, messages.tokenNotProvided, res);
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return error(http_codes.forbidden, messages.accessDenied, res);
      }

      next();
    } catch (err) {
      return error(http_codes.unAuthorized, messages.invalidExpiredToken, res);
    }
  };
};
module.exports = { auth };
