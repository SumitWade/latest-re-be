const fs = require('fs');
const path = require('path');
const logger = require('./pino-logger'); // import logger

// Define logs directory path
const logsDir = path.join(process.cwd(), 'logs');

// Delete logs older than 15 days
const pinoLoggerCleanup = (daysToKeep = 15) => {
  try {
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) return;

    // Read all files inside logs folder
    const files = fs.readdirSync(logsDir);

    // Current timestamp
    const now = Date.now();

    files.forEach((file) => {
      // Extract date from filename
      // Supported formats:
      // error-YYYY-MM-DD.log
      // warn-YYYY-MM-DD.log
      // fatal-YYYY-MM-DD.log
      const fileDate = file.match(/\d{4}-\d{2}-\d{2}/)?.[0];

      // Skip file if date not found
      if (!fileDate) return;

      // Convert file date to timestamp
      const fileTime = new Date(fileDate).getTime();

      // Calculate file age in days
      const days = (now - fileTime) / (1000 * 60 * 60 * 24);

      // Delete file if older than defined days
      if (days > daysToKeep) {
        const filePath = path.join(logsDir, file);

        // Delete log file
        fs.unlinkSync(filePath);

        // Log cleanup activity
        logger.error({
          event: 'Pino_log_cleanup',
          file,
          message: `Old log file : ${file} deleted`,
        });
      }
    });
  } catch (error) {
    // Log cleanup error
    logger.error({
      event: 'log_cleanup_error',
      message: error.message,
      stack: error.stack,
    });
  }
};

module.exports = pinoLoggerCleanup;
