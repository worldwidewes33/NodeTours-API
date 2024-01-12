const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Tour Routes
app.use("/api/tours", tourRouter);

module.exports = app;
