const fs = require("fs");
const path = require("path");

const express = require("express");

// read tours from file
let tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, "dev-data", "data", "tours-simple.json"))
);

const app = express();

app.use(express.json());

// Tour Routes
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
        res.status(500).json({
          status: "error",
          message: "unable to write to tours file",
          data: err,
        });
      }

      res.status(201).json({ status: "success", data: { tour: newTour } });
    }
  );
});

app.get("/api/tours/:id", (req, res) => {
  const id = +req.params.id;
  if (id > tours.length) {
    res
      .status(400)
      .json({ status: "fail", data: { id: `${id} is not a valid ID` } });
  }

  const tour = tours.find((el) => el.id === id);

  res.status(200).json({ status: "success", data: { tour } });
});

app.patch("/api/tours/:id", (req, res) => {
  const id = +req.params.id;
  if (id > tours.length) {
    res
      .status(400)
      .json({ status: "fail", data: { id: `${id} is not a valid ID` } });
  }

  const tour = tours.find((el) => el.id === id);

  for ([key, value] of Object.entries(req.body)) {
    if (tour[key]) {
      tour[key] = value;
    }
  }

  res.status(200).json({ status: "success", data: { tour } });
});

app.delete("/api/tours/:id", (req, res) => {
  const id = +req.params.id;
  if (id > tours.length) {
    res
      .status(400)
      .json({ status: "fail", data: { id: `${id} is not a valid ID` } });
  }

  tours = tours.filter((el) => el.id !== id);
  fs.writeFile(
    path.join(__dirname, "dev-data", "data", "tours-simple.json"),
    JSON.stringify(tours),
    (err) => {
      if (err) {
        res.status(500).json({
          status: "error",
          message: "unable to write to tours file",
          data: err,
        });
      }
      res.status(204).json({ status: "success", data: null });
    }
  );
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
