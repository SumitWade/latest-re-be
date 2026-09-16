require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const cron = require("node-cron");

// Validate and load env variables first
const envConfig = require('./src/config/env.config');
const logger = require('./src/utils/helper/pino-logger');
const { connectToDatabase, disconnectFromDatabase } = require('./src/db/db');
// const { initCronJobs } = require('./src/utils/cron-jobs');
const notificationService = require('./src/services/notification.service');

// Load express app
const app = require('./app');
const expireSubscriptions = require('./src/controller/subscription-model/purchase-model/inactive-expired-subscription');

// Sets the server port from configuration defaults
const PORT = envConfig.port;

// Creates an HTTP server using the Express app
const server = http.createServer(app);

// Initializes a new instance of Socket.IO
const io = socketIo(server);
// Make it available globally
global.io = io;

// Socket.io connection event
io.on('connection', (socket) => {
  logger.info('A user connected');
  // Listen for join with userId
  socket.on('join', async (userId) => {
    socket.join(userId?.toString());
    logger.info(`User ${userId} joined their room`);

    // Send current count right away
    await notificationService.getNotificationCountAndEmit(io, userId);
  });

  socket.on('disconnect', () => {
    logger.info('A user disconnected');
  });
});

// Connect to database
connectToDatabase();

// Initialize Cron Jobs
cron.schedule("0 2 * * *", async () => {
    try {
        await expireSubscriptions();
        console.log(`Expired subscriptions update`);
    } catch (error) {
        console.error("Subscription expiry cron failed:", error);
    }
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  logger.error({ event: 'server_shutdown' });
  await disconnectFromDatabase();
  process.exit(0);
});

// Start the express server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${envConfig.env} mode`);
});

// Server errors
server.on('error', (error) => {
  logger.fatal(
    {
      event: 'server_start_error',
      error: error.message,
    },
    'Server failed to start',
  );
});

// Node process warnings and errors
process.on('warning', (warning) => {
  logger.warn(
    {
      event: 'node_warning',
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
    },
    'Node process warning',
  );
});

process.on('uncaughtException', (error) => {
  logger.error({
    event: 'uncaught_exception',
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({
    event: 'unhandled_rejection',
    error: reason?.message || reason,
    stack: reason?.stack,
  });
});
