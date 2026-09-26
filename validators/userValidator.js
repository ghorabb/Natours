const Joi = require('joi');

const { ObjectIdValidation } = require('../middleware/validationMiddleware');

exports.getUser = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
}).required();

exports.updateMe = Joi.object({
  name: Joi.string().min(3).max(40).trim(),
  email: Joi.string().email().messages({
    'string.email': 'Please enter a valid email',
  }),
}).required();

exports.updateUser = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
  name: Joi.string().min(3).max(40).trim(),
  email: Joi.string().email().messages({
    'string.email': 'Please enter a valid email',
  }),
  role: Joi.string().valid('user', 'admin', 'guide', 'lead-guide'),
  isVerified: Joi.boolean(),
  active: Joi.boolean(),
}).required();

exports.deleteUser = Joi.object({
  id: Joi.string().custom(ObjectIdValidation).required(),
}).required();
