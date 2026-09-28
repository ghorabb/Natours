const Joi = require('joi');
const { ObjectIdValidation } = require('../middleware/validationMiddleware');

const mongoIdSchema = Joi.string().custom(ObjectIdValidation);

// const geoPointSchema = Joi.object({
//   type: Joi.string().valid('Point').default('Point'),
//   coordinates: Joi.array().items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90)).length(2).required(),
//   address: Joi.string(),
//   description: Joi.string(),
// });

//Create Tour
exports.createTour = Joi.object({
  name: Joi.string().min(6).max(40).trim().required(),
  ratingsAverage: Joi.number().min(1).max(5),
  ratingsQuantity: Joi.number().min(0),
  price: Joi.number().min(0).required(),
  priceDiscount: Joi.number().min(0).less(Joi.ref('price')).messages({
    'number.less': 'Discount price must be lower than the regular price',
  }),
  duration: Joi.number().integer().min(1).required(),
  maxGroupSize: Joi.number().integer().min(1).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'difficult').required(),
  summary: Joi.string().trim(),
  description: Joi.string().trim().required(),
  startDates: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      participants: Joi.number().integer().min(0).default(0),
      soldout: Joi.boolean().default(false),
    }),
  ),
  startLocation: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
    address: Joi.string(),
    description: Joi.string(),
  }),
  locations: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('Point'),

      coordinates: Joi.array().items(Joi.number()).length(2),
      address: Joi.string(),
      description: Joi.string(),
      day: Joi.number().integer().min(1),
    }),
  ),
  guides: Joi.array().items(mongoIdSchema),
}).required();

//Update Tour
exports.updateTour = Joi.object({
  id: mongoIdSchema.required(),
  name: Joi.string().min(6).max(40).trim(),
  ratingsAverage: Joi.number().min(1).max(5),
  ratingsQuantity: Joi.number().integer().min(0),
  price: Joi.number().min(0),
  priceDiscount: Joi.number().min(0).less(Joi.ref('price')).messages({
    'number.less': 'Discount price must be lower than the regular price',
  }),
  duration: Joi.number().integer().min(1),
  maxGroupSize: Joi.number().integer().min(1),
  difficulty: Joi.string().valid('easy', 'medium', 'difficult'),
  summary: Joi.string().trim(),
  description: Joi.string().trim(),
  startDates: Joi.array().items(
    Joi.object({
      date: Joi.date(),
      participants: Joi.number().integer().min(0),
      soldout: Joi.boolean(),
    }),
  ),
  startLocation: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
    address: Joi.string(),
    description: Joi.string(),
  }),
  locations: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
      address: Joi.string(),
      description: Joi.string(),
      day: Joi.number().integer().min(1),
    }),
  ),
  guides: Joi.array().items(mongoIdSchema),
})
  .min(1)
  .required();

// Validates GET /:id, PATCH /:id, DELETE /:id
exports.tourIdParam = Joi.object({
  id: mongoIdSchema.required(),
});

// Validates GET /monthly-plan/:year
exports.monthlyPlanParam = Joi.object({
  year: Joi.number().integer().min(1900).max(2100).required(),
});

// Validates GET /tours-within/:distance/center/:latlng/unit/:unit
exports.toursWithinParam = Joi.object({
  distance: Joi.number().positive().required(),
  latlng: Joi.string()
    .pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|(\d{1,2}))(\.\d+)?)$/)
    .required()
    .messages({
      'string.pattern.base': 'latlng must be in format lat,lng (e.g. 34.111745,-118.113491)',
    }),
  unit: Joi.string().valid('mi', 'km').required(),
});

// Validates GET /distances/:latlng/unit/:unit
exports.getDistancesParam = Joi.object({
  latlng: Joi.string()
    .pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|(\d{1,2}))(\.\d+)?)$/)
    .required()
    .messages({
      'string.pattern.base': 'latlng must be in format lat,lng (e.g. 34.111745,-118.113491)',
    }),
  unit: Joi.string().valid('mi', 'km').required(),
});
