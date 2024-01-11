const fs = require("fs");
const path = require("path");

// read tours from file
let tours = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "dev-data", "data", "tours-simple.json")
  )
);

exports.getAllTours = (req, res) => {
  res.status(200).json({ status: "success", data: { tours } });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);

  // write new tour to file
  fs.writeFile(
    path.join(__dirname, "..", "dev-data", "data", "tours-simple.json"),
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
};

exports.getTour = (req, res) => {
  const id = +req.params.id;

  const tour = tours.find((el) => el.id === id);

  res.status(200).json({ status: "success", data: { tour } });
};

exports.deleteTour = (req, res) => {
  const id = +req.params.id;

  tours = tours.filter((el) => el.id !== id);

  // write updated tours to file
  fs.writeFile(
    path.join(__dirname, "..", "dev-data", "data", "tours-simple.json"),
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
};

exports.updateTour = (req, res) => {
  const id = +req.params.id;

  const tour = tours.find((el) => el.id === id);

  for ([key, value] of Object.entries(req.body)) {
    if (tour[key]) {
      tour[key] = value;
    }
  }

  res.status(200).json({ status: "success", data: { tour } });
};

exports.verifyID = (req, res, next, id) => {
  if (+id > tours.length) {
    res
      .status(400)
      .json({ status: "fail", data: { id: `${id} is not a valid ID` } });
  }

  next();
};

exports.verifyBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: "fail",
      data: { tour: req.body },
      message: "tour requires a valid name and price field",
    });
  } else next();
};
