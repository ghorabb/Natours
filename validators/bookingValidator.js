const Joi = require('joi');

const { ObjectIdValidation } = require('../middleware/validationMiddleware');

// Create booking
exports.createBooking = Joi.object({
  tourId: Joi.string().custom(ObjectIdValidation).required(),
  paymentMethod: Joi.string().valid('cash', 'card').required(),
  paid: Joi.boolean(),
  dateId: Joi.string().custom(ObjectIdValidation).required(),
}).required();

// Get one booking
exports.getBooking = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
}).required();

// Update booking
exports.updateBooking = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),

  paymentMethod: Joi.string().valid('cash', 'card'),
  paid: Joi.boolean(),
  status: Joi.string().valid('pending', 'confirmed', 'cancelled'),
}).required();

// Delete booking
exports.deleteBooking = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
}).required();
