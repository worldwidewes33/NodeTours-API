const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const APIError = require("./util/apiError");

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Tour Routes
app.use("/api/tours", tourRouter);

app.all("*", (req, res, next) => {
  const error = new APIError(
    `Cannot reach ${req.originalUrl} on this server.`,
    404
  );
  next(error);
});

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  res
    .status(error.statusCode)
    .json({ status: error.status, message: error.message });
});

module.exports = app;
