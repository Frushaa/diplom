const Joi = require('joi');

const bookingSchema = Joi.object({
  service_id: Joi.number().integer().required(),
  work_slot_id: Joi.number().integer().required(),
  start_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  duration: Joi.number()
    .integer()
    .min(30)
    .max(120) 
    .required()
});

module.exports = { bookingSchema };