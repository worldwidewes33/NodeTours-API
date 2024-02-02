const Review = require('../models/reviewModel');
const catchAsync = require('../util/catchAsync');
const QueryAPI = require('../util/queryApi');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const queryApi = new QueryAPI(Review.find(), req.query);

  queryApi.filter().sort().limitFields().paginate();

  const reviews = await queryApi.query;

  res.status(200).json({ status: 'success', data: reviews });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    author: req.user.id,
    tour: req.body.tour,
  });

  res.status(201).json({ status: 'success', data: { review: newReview } });
});
