const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  if (req.originalUrl === '/favicon.ico') {
    return next();
  }
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      message: 'HTTP request',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

module.exports = requestLogger;