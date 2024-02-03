/**
 * @module tourController
 * All CRUD operations for the Tour Model
 */

const Tour = require('../models/tourModel');
const factory = require('./helperFactory');

exports.getAllTours = factory.getMany(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
