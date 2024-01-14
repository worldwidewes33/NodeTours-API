const Tour = require("./../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({});
    res.status(200).json({ status: "success", data: { tours } });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Unable to query database" });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: "success", data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      data: err,
    });
  }
};

exports.getTour = (req, res) => {
  const id = +req.params.id;

  // res.status(200).json({ status: "success", data: { tour } });
};

exports.deleteTour = (req, res) => {
  const id = +req.params.id;
  // res.status(204).json({ status: "success", data: null });
};

exports.updateTour = (req, res) => {
  const id = +req.params.id;

  // res.status(200).json({ status: "success", data: { tour } });
};
