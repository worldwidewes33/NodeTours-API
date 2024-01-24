/**
 * @module app
 */

const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const APIError = require("./util/apiError");
const errorHandler = require("./controllers/errorController");

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Tour Routes
app.use("/api/tours", tourRouter);

// User Routes
app.use("/api/users", userRoutes);

// Catch all route
app.all("*", (req, res, next) => {
  const error = new APIError(
    `Cannot reach ${req.originalUrl} on this server.`,
    404
  );
  next(error);
});

app.use(errorHandler);

module.exports = app;
