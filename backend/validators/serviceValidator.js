const Joi = require('joi');

const serviceSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).allow(''),
  price: Joi.number().positive().precision(2).required(),
  duration: Joi.string().pattern(/^\d+\.?\d*\s(minutes|hour|hours)$/).required()
});

module.exports = { serviceSchema };