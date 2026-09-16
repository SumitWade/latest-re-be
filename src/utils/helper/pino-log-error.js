// Common error logger utility

const logger = require('./pino-logger');

// Used to log errors in a structured format using pino logger
const logError = (error, options = {}) => {
  //send api name in the api and complete request in req
  const { api = '', req = null } = options;

  // Split stack trace into lines
  const stackLines = error?.stack?.split('\n');

  // Get all project lines (exclude node_modules & node internals)
  const projectStacks = stackLines?.filter(
    (line) => line && !line.includes('node_modules') && !line.includes('node:internal'),
  );

  // Pick last meaningful stack (controller level)
  const controllerStack = projectStacks?.[projectStacks.length - 1];

  // Combine error message + controller stack
  const filteredStack = [
    // stackLines?.[0],
    controllerStack?.trim(),
  ]
    .filter(Boolean)
    .join('\n');

  // Log structured error using pino
  logger.error({
    api, // API name
    type: 'server_error', // error type
    url: req?.originalUrl, // request URL (if available)
    message: error.message, // error message
    stack: filteredStack, // filtered stack trace
  });
};

module.exports = logError;
