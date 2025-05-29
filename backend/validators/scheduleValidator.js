const Joi = require('joi');

const workSlotSchema = Joi.object({
  date: Joi.date().iso().required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
});

const slotIdSchema = Joi.number().integer().positive().required();

module.exports = { workSlotSchema, slotIdSchema };