const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: [1, 'A ratings cannot be less than 1'],
      max: [5, 'A rating cannot be greater than 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
  },
  {
    toJson: { virtuals: true },
    toObject: { viturals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  // Populate both the author and tour
  // this.populate({
  //   path: 'author',
  //   select: 'name photo',
  // }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  this.populate({
    path: 'author',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // Aggregate pipeline to get review stats
  const stats = await this.aggregate([
    {
      $match: { tour: new mongoose.Types.ObjectId(tourId) },
    },
    {
      $group: {
        _id: null,
        numOfRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);

  const { numOfRatings: ratingsQuantity, avgRatings: ratingsAverage } =
    stats[0];
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity,
    ratingsAverage,
  });
};

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.model.findOne(this.getQuery());
  next();
});

reviewSchema.post('save', function (doc, next) {
  this.constructor.calcAverageRatings(doc.tour);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
