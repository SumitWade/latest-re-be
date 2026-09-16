const logger = require('../utils/helper/pino-logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  logger.error({
    event: 'server_error',
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(error.status || 500).json({
    status: 'FAILED',
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
