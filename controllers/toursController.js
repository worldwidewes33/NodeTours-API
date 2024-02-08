/**
 * @module tourController
 * All CRUD operations for the Tour Model
 */

const Tour = require('../models/tourModel');
const factory = require('./helperFactory');
const catchAsync = require('../util/catchAsync');
const APIError = require('../util/apiError');

exports.getAllTours = factory.getMany(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    const error = new APIError(
      'Please send latitude and longitude in format lat,lng.',
      400,
    );
    next(error);
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({ status: 'success', data: { tours } });
});
