const pool = require('../../config/db');
const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const Booking = require('../../models/Booking');
const { 
  getWorkSlotDetails, 
  getBookingsForSlot, 
  checkTimeAvailability,
  extractMinutesFromInterval
} = require('../../utils/bookingUtils');

async function getServiceDuration(serviceId) {
  const res = await pool.query(
    'SELECT duration FROM services WHERE id = $1',
    [serviceId]
  );
  return res.rows[0]?.duration;
}

router.post('/', authenticate, checkRole('client'), async (req, res) => {
  try {
    const { service_id, work_slot_id, start_time } = req.body;
    const client_id = req.user.id;

    // 1. Получаем данные услуги и рабочего слота
    const [serviceRes, workSlotRes] = await Promise.all([
      pool.query('SELECT duration FROM services WHERE id = $1', [service_id]),
      pool.query('SELECT date FROM work_slots WHERE id = $1', [work_slot_id])
    ]);

    if (serviceRes.rows.length === 0 || workSlotRes.rows.length === 0) {
      return res.status(404).json({ 
        error: serviceRes.rows.length === 0 ? 'Услуга не найдена' : 'Рабочий слот не найден'
      });
    }

    const serviceDuration = serviceRes.rows[0].duration;
    const bookingDuration = '2:00:00'; // Фиксированная длительность брони
    const date = workSlotRes.rows[0].date;

    // 2. Создаем бронирование
    const result = await pool.query(
      `INSERT INTO bookings 
       (client_id, service_id, work_slot_id, date, 
        start_time, duration, service_duration, status)
       VALUES ($1, $2, $3, $4, $5, $6::interval, $7::interval, 'pending')
       RETURNING *`,
      [
        client_id, 
        service_id, 
        work_slot_id, 
        date,
        start_time,
        bookingDuration,
        serviceDuration
      ]
    );

    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    // 3. Обрабатываем ошибки
    if (err.code === '23P01') {
      return res.status(400).json({ error: 'Выбранное время занято' });
    }
    
    console.error('Ошибка бронирования:', {
      error: err,
      body: req.body
    });
    res.status(500).json({ error: 'Ошибка сервера' });
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

router.get('/available-slots/:workSlotId', authenticate, async (req, res) => {
  try {
    const workSlot = await getWorkSlotDetails(req.params.workSlotId);
    const bookings = await getBookingsForSlot(req.params.workSlotId);
    
    res.json({
      slotStart: workSlot.start_time,
      slotEnd: workSlot.end_time,
      bookings: bookings.map(b => ({
        start: b.start_time,
        duration: b.duration 
      }))
    });
  } catch (error) {
    console.error('Ошибка при получении слотов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

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