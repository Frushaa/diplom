const pool = require('../../config/db');
const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const Notification = require('../../models/Notification');
const { sendNotification } = require('../../websocket');
const Booking = require('../../models/Booking');
const { 
  getWorkSlotDetails, 
  getBookingsForSlot, 
} = require('../../utils/bookingUtils');

router.post('/', authenticate, checkRole('client'), async (req, res) => {
  try {
    const { service_id, work_slot_id, start_time } = req.body;
    const client_id = req.user.id;

    const [serviceRes, workSlotRes] = await Promise.all([
      pool.query('SELECT s.duration, s.title FROM services s WHERE s.id = $1', [service_id]),
      pool.query('SELECT date, master_id FROM work_slots WHERE id = $1', [work_slot_id])
    ]);

    if (serviceRes.rows.length === 0 || workSlotRes.rows.length === 0) {
      return res.status(404).json({ 
        error: serviceRes.rows.length === 0 ? 'Услуга не найдена' : 'Рабочий слот не найден'
      });
    }

    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'long' };
      return date.toLocaleDateString('ru-RU', options);
    };

    const formatTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    };

    const service = serviceRes.rows[0];
    const workSlot = workSlotRes.rows[0];
    const serviceDuration = serviceRes.rows[0].duration;
    const bookingDuration = '2:00:00';
    const date = workSlotRes.rows[0].date;

    const bookingDate = new Date(workSlot.date);
    const formattedDate = formatDate(bookingDate);
    const formattedTime = formatTime(start_time); 

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

    const booking = result.rows[0];

    const clientMessage = `Вы записаны на услугу "${service.title}" на ${formattedDate} в ${formattedTime}`;
    await Notification.create({
      user_id: client_id,
      message: clientMessage,
      booking_id: booking.id,
      type: 'client'
    });
    await sendNotification(client_id, {
      message: clientMessage,
      booking_id: booking.id,
      created_at: new Date().toISOString()
    });

    if (workSlot.master_id) {
      const masterMessage = `К вам записался клиент "${req.user.username}" на ${formattedDate} в ${formattedTime} на услугу "${service.title}"`;
      
      await Notification.create({
        user_id: workSlot.master_id,
        message: masterMessage,
        booking_id: booking.id,
        type: 'master'
      });
      
      await sendNotification(client_id, {
        message: clientMessage,
        booking_id: booking.id,
        created_at: new Date().toISOString()
      });
    }


    res.status(201).json(result.rows[0]);
    
  } catch (err) {
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

router.get('/upcoming', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findUpcomingByClient(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error('Ошибка при получении предстоящих записей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/client/history', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findHistoryByClient(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', authenticate, checkRole('client'), async (req, res) => {
  try {
    const booking = await Booking.cancel(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    res.json({ message: 'Запись успешно отменена' });
  } catch (err) {
    console.error('Ошибка при отмене записи:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/master', authenticate, checkRole('master'), async (req, res) => {
  try {
    const { status, upcoming, history } = req.query;
    const masterId = req.user.id;
    
    let query = `
      SELECT 
        b.id, 
        b.date, 
        b.start_time, 
        b.duration, 
        b.status,
        s.title as service_title,
        s.price,
        u.username as client_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      JOIN work_slots ws ON b.work_slot_id = ws.id
      WHERE ws.master_id = $1
    `;
    
    const params = [masterId];
    
    if (upcoming === 'true') {
      query += ' AND (b.date > CURRENT_DATE OR (b.date = CURRENT_DATE AND b.start_time > CURRENT_TIME))';
    }
    
    if (history === 'true') {
      query += ' AND (b.date < CURRENT_DATE OR (b.date = CURRENT_DATE AND b.start_time < CURRENT_TIME))';
    }
    
    query += ' ORDER BY b.date, b.start_time';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении записей мастера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;