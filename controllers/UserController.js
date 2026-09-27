const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/UserModel');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const buffer = await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toBuffer();

  const result = await uploadToCloudinary(buffer, 'natours/users', `user-${req.user._id}`);

  req.body.photo = result.secure_url;
  req.body.photoPublicId = result.public_id;

  next();
});

//Users
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No User found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = asyncHandler(async (req, res, next) => {
  //Error if user entered password
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route is not for update password..', 400));
  }

  // Only allow name and email
  const filteredObj = {};
  if (req.body.name) {
    filteredObj.name = req.body.name;
  }
  if (req.body.email) {
    filteredObj.email = req.body.email;
  }
  if (req.body.photo) {
    filteredObj.photo = req.body.photo;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, { new: true, runValidators: true });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No User found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No User found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    message: null,
  });
});
