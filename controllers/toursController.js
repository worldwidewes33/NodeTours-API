const Tour = require("./../models/tourModel");
const QueryAPI = require("./../util/queryApi");

exports.getAllTours = async (req, res) => {
  try {
    const queryAPI = new QueryAPI(Tour.find(), req.query);

    queryAPI.filter().sort().limitFields().paginate();

    const tours = await queryAPI.query;

    // send response
    res.status(200).json({ status: "success", data: { tours } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
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
