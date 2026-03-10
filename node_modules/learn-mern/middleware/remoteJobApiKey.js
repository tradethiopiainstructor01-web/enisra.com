const readBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') return '';
  const [scheme, token] = authorizationHeader.split(' ');
  if ((scheme || '').toLowerCase() !== 'bearer') return '';
  return (token || '').trim();
};

const extractApiKey = (req) => {
  const headerValue =
    req.headers['x-api-key'] ||
    req.headers['x-remote-api-key'] ||
    req.headers['x-job-api-key'];

  if (typeof headerValue === 'string' && headerValue.trim()) {
    return headerValue.trim();
  }

  return readBearerToken(req.headers.authorization);
};

const protectRemoteJobPost = (req, res, next) => {
  const expectedApiKey = (process.env.REMOTE_JOB_POST_API_KEY || '').trim();

  if (!expectedApiKey) {
    return res.status(503).json({
      success: false,
      message: 'Remote job posting API is not configured.',
    });
  }

  const providedApiKey = extractApiKey(req);
  if (!providedApiKey || providedApiKey !== expectedApiKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing remote job posting API key.',
    });
  }

  req.remoteJobPost = {
    authenticated: true,
    source: 'remote-api',
  };

  next();
};

module.exports = {
  protectRemoteJobPost,
};
