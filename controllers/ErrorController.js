const multer = require('multer');
const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');

  return new AppError(`Invalid input data. ${message}`, 400);
};

const handleDuplicateFields = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field ${value}. Please use another value.;`;

  return new AppError(message, 400);
};

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File is too large. Maximum allowed size is 10 MB.', 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('You upload more images than that allowed.', 400);
  }

  return new AppError('Error uploading file.', 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({ status: err.status, error: err, message: err.message, stack: err.stack });
  }

  if (err.name === 'ValidationError') {
    err = handleValidationError(err);
  }

  if (err.name === 'CastError') {
    err = handleCastError(err);
  }

  if (err.code === 11000) {
    err = handleDuplicateFields(err);
  }

  if (err instanceof multer.MulterError) {
    err = handleMulterError(err);
  }

  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
