const Joi = require('joi');

exports.signup = Joi.object({
  name: Joi.string().min(3).max(40).trim().required(),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
}).required();

exports.activateAccount = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
  }),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'Activation code must be 6 digits',
      'string.pattern.base': 'Activation code must contain only numbers',
    }),
}).required();

exports.login = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().min(8).required(),
}).required();
exports.forgotPassword = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
  }),
}).required();

exports.resetPassword = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
  }),
  forgetCode: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'Reset code must be 6 digits',
      'string.pattern.base': 'Reset code must contain only numbers',
    }),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
}).required();

exports.updatePassword = Joi.object({
  currentPassword: Joi.string().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
}).required();
