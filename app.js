const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const responseMiddleware = require('./src/middlewares/response-middleware');
const { rateLimiterMiddleware } = require('./src/middlewares/rate-limiting');
const errorHandler = require('./src/middlewares/errorHandler');
const routes = require('./src/routes/routes');

// Initialize express app
const app = express();

// ensure real client ip
app.set('trust proxy', 1);

// Parses incoming requests with JSON payloads
app.use(express.json());

// Parses incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Enables Cross-Origin Resource Sharing (CORS)
app.use(cors({ origin: '*' }));

// Logs HTTP requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// automatically sets secure HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }));

// Apply global rate limiting
app.use(rateLimiterMiddleware);

// Pass the global Socket.io instance to routes or middleware
app.use((request, response, next) => {
  request.io = global.io;
  next();
});

// response middleware
app.use(responseMiddleware);

// Versioned API routes
app.use('/', routes);

// Serve files from root directory
app.use('/getFiles', express.static(path.join(__dirname, '')));

app.get('/', (request, response) => {
  response.status(200).json({
    message: 'Real Estate 2026 Backend is live 🏃‍♂️🏃‍♂️',
  });
});

// If routes not found
app.use((request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

// Error Handler
// app.use(errorHandler);

module.exports = app;
