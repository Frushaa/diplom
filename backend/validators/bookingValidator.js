const Joi = require('joi');

const bookingSchema = Joi.object({
  service_id: Joi.number().integer().required(),
  work_slot_id: Joi.number().integer().required(),
});

module.exports = { bookingSchema };