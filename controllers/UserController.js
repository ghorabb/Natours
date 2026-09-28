const User = require('../models/UserModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asynchandler');
const cloudinary = require('../utils/cloudinary');
const uploadphoto = require('../utils/uploadPhoto');

exports.uploadUserPhoto = uploadphoto().single('photo');

exports.updatePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('No User found with that ID', 404));
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'natours/users',
    public_id: `user-${req.user._id}`,

    transformation: [
      {
        width: 500,
        height: 500,
        crop: 'fill',
        gravity: 'face',
      },
    ],

    format: 'jpg',
    quality: 'auto',
    fetch_format: 'auto',
    resource_type: 'image',
  });

  req.body.photo = {
    publicId: result.public_id,
    url: result.secure_url,
  };

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
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No User found with that ID', 404));
  }

  if (user.photo?.publicId) {
    await cloudinary.uploader.destroy(user.photo.publicId);
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    message: null,
  });
});
