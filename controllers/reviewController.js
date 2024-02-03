const Review = require('../models/reviewModel');
const catchAsync = require('../util/catchAsync');
const factory = require('./helperFactory');

exports.verifyBody = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.author) req.body.author = req.user.id;
  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let query;
  if (req.params.tourId) {
    query = Review.find({ tour: req.params.tourId });
  } else {
    query = Review.find();
  }
  const reviews = await query;

  res.status(200).json({ status: 'success', data: reviews });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById({ _id: req.params.id });

  res.status(200).json({ status: 'success', data: review });
});

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
