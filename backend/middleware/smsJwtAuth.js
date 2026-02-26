const jwt = require('jsonwebtoken');

const smsJwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    if (decoded?.type !== 'sms_subscription_auth') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.'
      });
    }

    req.smsUser = {
      msisdn: decoded.msisdn
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired.'
    });
  }
};

module.exports = {
  smsJwtAuth
};
