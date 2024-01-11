const express = require("express");

const tourRouter = require("./routes/tourRoutes");

const app = express();

app.use(express.json());

// Tour Routes
app.use("/api/tours", tourRouter);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
