const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/UserModel');
const asyncHandler = require('../utils/asynchandler');
const AppError = require('../utils/appError');
const SendEmail = require('../utils/sendEmail');
const { activateAccountTemplate, forgotPasswordCodeTemplate } = require('../utils/htmlTemplates');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendCookie = (res, token) => {
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: true,
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const activationCode = newUser.createEmailActivation();
  await newUser.save({ validateBeforeSave: false });

  // 1) Generate Welcome Email HTML
  const html = activateAccountTemplate({
    name: newUser.name,
    code: activationCode,
  });

  // 2) Send Email

  try {
    await SendEmail({
      to: newUser.email,
      subject: 'Welcome to our platform, Please activate your email!',
      html,
    });
    res.status(201).json({
      status: 'success',
      message: 'Activation code sent to your email!',
    });
  } catch (err) {
    newUser.emailVerificationCode = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(new AppError('Error sending activation email. Try again later!', 500));
  }
});

exports.activateAccount = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return next(new AppError('Please provide email and activation code please,', 400));
  }

  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  const user = await User.findOne({
    email,
    emailVerificationCode: hashedCode,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('code is ivalid or expired.', 400));
  }

  user.isVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  createSendCookie(res, token);

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!',
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // if email && password exist
  if (!email || !password) {
    return next(new AppError('Please enter your email or password', 400));
  }

  //check if user exist and password is correct

  const user = await User.findOne({ email }).select('+password +isVerified');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isVerified) {
    return next(new AppError('Please verify your Account', 401));
  }

  const token = signToken(user._id);

  createSendCookie(res, token);

  res.status(200).json({
    status: 'success',
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // let token;
  // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1];
  // }

  //Get token and check if it is exist
  const token = req.cookies.jwt;

  if (!token) {
    return next(new AppError('You are not logged in! Please login...', 401));
  }
  //verify token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  req.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have the permission to perform this action', 403));
    }
    next();
  };

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //Get email and check user
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide your email.', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // Generate random reset token
  const forgetCode = user.createPasswordResetCode();
  await user.save({ validateBeforeSave: false });

  // // Send it to user email
  // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const html = forgotPasswordCodeTemplate({
    name: user.name,
    code: forgetCode,
  });

  try {
    await SendEmail({
      to: user.email,
      subject: 'Your Forget Code (valid for 10 min)',
      html,
    });

    res.status(200).json({
      status: 'success',
      message: 'Forget Code sent to email!',
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, forgetCode, password, confirmPassword } = req.body;

  if (!email || !forgetCode || !password || !confirmPassword) {
    return next(new AppError('Please provide email, forgetCode, password, and confirmPassword', 400));
  }

  const hashedCode = crypto.createHash('sha256').update(forgetCode).digest('hex');

  const user = await User.findOne({ passwordResetCode: hashedCode, passwordResetExpires: { $gt: Date.now() } });

  if (!user) {
    return next(new AppError('Reset code is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);

  createSendCookie(res, token);

  res.status(200).json({
    status: 'success',
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  //check user
  const user = await User.findById(req.user._id).select('+password');

  //check old password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  //set new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  const token = signToken(user._id);

  createSendCookie(res, token);

  res.status(200).json({
    status: 'success',
  });
});
