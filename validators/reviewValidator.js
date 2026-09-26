const Joi = require('joi');

const { ObjectIdValidation } = require('../middleware/validationMiddleware');

// Create review
exports.createReview = Joi.object({
  tourId: Joi.string().custom(ObjectIdValidation).required(),
  review: Joi.string().trim().required(),
  rating: Joi.number().min(1).max(5).required(),
}).required();

// Get one review
exports.getReview = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
}).required();

// Update review
exports.updateReview = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
  review: Joi.string().trim(),
  rating: Joi.number().min(1).max(5),
}).required();

// Delete review
exports.deleteReview = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
}).required();
