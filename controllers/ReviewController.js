const Booking = require('../models/BookingModel');
const Review = require('../models/ReviewModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asynchandler');

exports.getAllReviews = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Review.find({ tour: req.params.tourId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No Review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.createReview = asyncHandler(async (req, res, next) => {
  // Find a booking that matches the user AND tour
  const booking = await Booking.findOne({
    user: req.user.id,
    tour: req.params.tourId,
  });

  if (!booking) {
    return next(new AppError('You can only review tours that you have booked!', 403));
  }
  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.params.tourId,
    user: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      reviews: newReview,
    },
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError('No Review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No Review found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    message: null,
  });
});
