const Tour = require("./../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    // BASIC FILTERS
    const queryObj = { ...req.query };
    const excludedFields = ["sort", "page", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERS
    let queryStr = JSON.stringify(queryObj);

    // replace any instance of the words lt, lte, gt, gte with mongodb equivalent
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

    const tours = await Tour.find(JSON.parse(queryStr));

    // send response
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
    res.status(400).json({ status: "fail", data: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", data: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "fail", data: err });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", data: err });
  }
};
