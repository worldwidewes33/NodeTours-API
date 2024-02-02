/**
 * @module app
 */

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const APIError = require('./util/apiError');
const errorHandler = require('./controllers/errorController');

const app = express();

// Global Middleware Functions
// Set http security headers
app.use(helmet());

// Rate limiting
// configure rate limit middleware
const limiter = rateLimit({
  windowMS: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Parsing
app.use(express.json());
app.use(cookieParser());

// Sanitize requests against malicios mongodb code
app.use(mongoSanitize());

// Sanitize request against xss attack
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'price',
      'duration',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  }),
);

// request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Tour Routes
app.use('/api/tours', tourRouter);

// User Routes
app.use('/api/users', userRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Catch all route
app.all('*', (req, res, next) => {
  const error = new APIError(
    `Cannot reach ${req.originalUrl} on this server.`,
    404,
  );
  next(error);
});

app.use(errorHandler);

module.exports = app;
