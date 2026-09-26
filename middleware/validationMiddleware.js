const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const ObjectIdValidation = (value, helper) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return value;
  }

  return helper.message('Invalid ObjectId');
};

const validation = (schema) => {
  return (req, res, next) => {
    const data = {
      ...req.body,
      ...req.params,
      ...req.query,
    };

    const validationResult = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map((errorObj) => errorObj.message);

      return next(new AppError(errorMessages.join(', '), 400));
    }

    next();
  };
};

module.exports = {
  ObjectIdValidation,
  validation,
};
