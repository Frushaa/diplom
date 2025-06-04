const pool = require('../../config/db');
const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const Booking = require('../../models/Booking');
const { bookingSchema } = require('../../validators/bookingValidator');
const { checkTimeAvailability } =require ('../../utils/bookingUtils');

router.post('/', authenticate, checkRole('client'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { service_id, work_slot_id, start_time, duration } = req.body;
    const client_id = req.user.id;

    const isAvailable = await checkTimeAvailability(work_slot_id, start_time, duration);
    if (!isAvailable) {
      return res.status(400).json({ error: 'Выбранное время уже занято' });
    }

    const result = await pool.query(
      `INSERT INTO bookings 
       (client_id, service_id, work_slot_id, start_time, duration, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [client_id, service_id, work_slot_id, start_time, duration]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /bookings:', err.stack); 
    res.status(500).json({ 
      error: 'Ошибка сервера',
      message: err.message 
    });
  }
});

router.get(
  '/',
  authenticate,
  async (req, res) => {
    try {
      let bookings;
      if (req.user.role === 'client') {
        bookings = await Booking.findByClient(req.user.id);
      } else {

        bookings = await Booking.findByMaster(req.user.id);
      }
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

router.patch(
  '/:id/status',
  authenticate,
  checkRole('master'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await Booking.updateStatus(req.params.id, status);
      res.json(booking);
    } catch (err) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

module.exports = router;