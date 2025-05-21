const Joi = require('joi');

const workSlotSchema = Joi.object({
  date: Joi.date().iso().required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
});

const breakSchema = Joi.object({
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
});

const availableSlotsSchema = Joi.object({
    service_id: Joi.number().integer().required(),
  });
  

module.exports = { workSlotSchema, breakSchema, availableSlotsSchema };