/**
 * @module app
 */

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const tourRouter = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const APIError = require('./util/apiError');
const errorHandler = require('./controllers/errorController');

const app = express();

// configure rate limit middleware
const limiter = rateLimit({
  windowMS: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(cookieParser());
app.use(limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Tour Routes
app.use('/api/tours', tourRouter);

// User Routes
app.use('/api/users', userRoutes);

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
