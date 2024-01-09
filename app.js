const fs = require("fs");
const path = require("path");

const express = require("express");

// read tours from file
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, "dev-data", "data", "tours-simple.json"))
);

const app = express();

app.use(express.json());

app.get("/api/tours", (req, res) => {
  res.status(200).json({ status: "success", data: { tours } });
});

app.post("/api/tours", (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);

  fs.writeFile(
    path.join(__dirname, "dev-data", "data", "tours-simple.json"),
    JSON.stringify(tours),
    (err) => {
      if (err) {
        res.json({
          status: "error",
          message: "unable to write to tours file",
          data: err,
        });
      }

      res.json({ status: "success", data: { tour: newTour } });
    }
  );
});

app.listen(3000);
