const Review = require('../models/reviewModel');
const catchAsync = require('../util/catchAsync');

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

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    author: req.user.id,
    tour: req.params.tourId,
  });

  res.status(201).json({ status: 'success', data: { review: newReview } });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById({ _id: req.params.id });

  res.status(200).json({ status: 'success', data: review });
});
