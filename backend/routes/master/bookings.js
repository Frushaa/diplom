const pool = require('../../config/db');
const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const Booking = require('../../models/Booking');
const { bookingSchema } = require('../../validators/bookingValidator');

router.post(
  '/',
  authenticate,
  checkRole('client'),
  async (req, res) => {
    try {
      const { error } = bookingSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { service_id, work_slot_id } = req.body;
      const client_id = req.user.id;

      const slot = await pool.query(
        `SELECT * FROM work_slots 
        WHERE id = $1 
        AND master_id = (SELECT master_id FROM services WHERE id = $2)
        AND NOT EXISTS (
          SELECT 1 FROM bookings 
          WHERE work_slot_id = $1
        )`,
        [work_slot_id, service_id]
      );

      if (!slot.rows[0]) {
        return res.status(400).json({ error: 'Слот занят или недоступен' });
      }

      const booking = await Booking.create({ client_id, service_id, work_slot_id });
      res.status(201).json(booking);
    } catch (err) {
      console.error('Ошибка бронирования:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

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