/**
 * @module tourController
 * All CRUD operations for the Tour Model
 */

const Tour = require('../models/tourModel');
const QueryAPI = require('../util/queryApi');
const catchAsync = require('../util/catchAsync');
const APIError = require('../util/apiError');
const factory = require('./helperFactory');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const queryAPI = new QueryAPI(Tour.find(), req.query);

  queryAPI.filter().sort().limitFields().paginate();

  const tours = await queryAPI.query;

  // send response
  res.status(200).json({ status: 'success', data: { tours } });
});

exports.createTour = factory.createOne(Tour);

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(new APIError('No tour found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { tour } });
});

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
