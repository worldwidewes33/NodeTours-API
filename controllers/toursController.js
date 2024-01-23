/**
 * @module tourController
 * All CRUD operations for the Tour Model
 */

const Tour = require("./../models/tourModel");
const QueryAPI = require("./../util/queryApi");
const catchAsync = require("./../util/catchAsync");
const APIError = require("./../util/apiError");

exports.getAllTours = catchAsync(async (req, res, next) => {
  const queryAPI = new QueryAPI(Tour.find(), req.query);

  queryAPI.filter().sort().limitFields().paginate();

  const tours = await queryAPI.query;

  // send response
  res.status(200).json({ status: "success", data: { tours } });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: "success", data: { tour: newTour } });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new APIError("No tour found with that ID", 404));
  }

  res.status(200).json({ status: "success", data: { tour } });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new APIError("No tour found with that ID", 404));
  }

  res.status(204).json({ status: "success", data: null });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new APIError("No tour found with that ID", 404));
  }

  res.status(200).json({ status: "success", data: { tour } });
});
