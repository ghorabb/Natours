const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/TourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asynchandler');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.uploadToursImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = asyncHandler(async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) {
    return next();
  }

  if (req.files.imageCover) {
    const coverBuffer = await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const coverResult = await uploadToCloudinary(
      coverBuffer,
      'natours/tours',
      `tour-${req.params.id || 'new'}-${Date.now()}-cover`,
    );

    req.body.imageCover = coverResult.secure_url;
  }

  if (req.files.images) {
    req.body.images = await Promise.all(
      req.files.images.map(async (file, i) => {
        const buffer = await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toBuffer();

        const result = await uploadToCloudinary(
          buffer,
          'natours/tours',
          `tour-${req.params.id || 'new'}-${Date.now()}-${i + 1}`,
        );

        return result.secure_url;
      }),
    );
  }

  next();
});

// Alias Top Tours
exports.aliasTopTour = (req, res, next) => {
  const params = new URLSearchParams(req.query);

  params.set('limit', '5');
  params.set('sort', '-ratingsAverage,price');
  params.set('fields', 'name,price,ratingsAverage,summary,difficulty');

  req.url = `${req.path}?${params.toString()}`;

  next();
};

// Get All Tours
exports.getAllTours = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
});

// Get One Tour
exports.getTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(new AppError('No Tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Create New Tour
exports.createTour = asyncHandler(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
});

// Update Tour
exports.updateTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No Tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Delete Tour
exports.deleteTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No Tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

// Get Tours Statistics
exports.getToursStats = asyncHandler(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: {
          $sum: 1,
        },
        numRatings: {
          $sum: '$ratingsQuantity',
        },
        avgRating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgRating: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Get Monthly Plan
exports.getMonthlyPlan = asyncHandler(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        'startDates.date': {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates.date',
        },
        numTourStart: {
          $sum: 1,
        },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = asyncHandler(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(new AppError('Please provide latitute and longitude in the format lat,lng.', 400));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = asyncHandler(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(new AppError('Please provide latitute and longitude in the format lat,lng.', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
