const jwt = require('jsonwebtoken');

const scholarshipProtect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'default_secret';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const allowedTypes = new Set(['scholarship_access', 'subscription_access']);
    if (!allowedTypes.has(decoded?.type)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token.'
      });
    }

    req.scholarshipUser = {
      phoneNumber: decoded.phoneNumber || decoded.msisdn,
      msisdn: decoded.msisdn || decoded.phoneNumber
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
  scholarshipProtect
};
