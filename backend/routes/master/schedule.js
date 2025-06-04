const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const { workSlotSchema } = require('../../validators/scheduleValidator');

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const calculateAvailableTimes = (slotStart, slotEnd, bookings, minDuration) => {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  let availableTimes = [];
  let currentTime = slotStartMinutes;

  bookings.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  for (const booking of bookings) {
    const bookingStart = timeToMinutes(booking.start_time);
    const bookingEnd = bookingStart + booking.duration;

    if (bookingStart > currentTime) {
      const gapDuration = bookingStart - currentTime;
      if (gapDuration >= minDuration) {
        availableTimes.push({
          start: minutesToTime(currentTime),
          end: minutesToTime(bookingStart)
        });
      }
    }

    currentTime = Math.max(currentTime, bookingEnd);
  }

  if (slotEndMinutes > currentTime) {
    const remainingDuration = slotEndMinutes - currentTime;
    if (remainingDuration >= minDuration) {
      availableTimes.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(slotEndMinutes)
      });
    }
  }

  return availableTimes;
};

router.post('/work-slots', authenticate, checkRole('master'), async (req, res) => {
  try {
    const { error } = workSlotSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { date, start_time, end_time } = req.body;
    const master_id = req.user.id;

    if (start_time >= end_time) {
      return res.status(400).json({ error: 'Конец слота должен быть позже начала' });
    }

    const result = await pool.query(
      `INSERT INTO work_slots (master_id, date, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [master_id, date, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/work-slots', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        start_time,
        end_time
       FROM work_slots
       WHERE date >= CURRENT_DATE
       ORDER BY date, start_time`
    );
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Ошибка получения слотов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/available-times/:work_slot_id', async (req, res) => {
  try {
    const workSlotId = parseInt(req.params.work_slot_id);
    const { duration } = req.query;
    const minDuration = parseInt(duration) || 30;

    const slotResult = await pool.query(
      `SELECT start_time, end_time 
       FROM work_slots 
       WHERE id = $1`,
      [workSlotId]
    );

    if (slotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Рабочий слот не найден' });
    }

    const { start_time: slotStart, end_time: slotEnd } = slotResult.rows[0];

    const bookingsResult = await pool.query(
      `SELECT start_time, duration 
       FROM bookings 
       WHERE work_slot_id = $1`,
      [workSlotId]
    );

    const availableTimes = calculateAvailableTimes(
      slotStart,
      slotEnd,
      bookingsResult.rows,
      minDuration
    );

    res.status(200).json(availableTimes);
  } catch (err) {
    console.error('Ошибка получения доступного времени:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/work-slots/:id', authenticate, checkRole('master'), async (req, res) => {
  try {
    const slotId = req.params.id;
    const masterId = req.user.id;

    const bookingsCheck = await pool.query(
      'SELECT * FROM bookings WHERE work_slot_id = $1',
      [slotId]
    );
    
    if (bookingsCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить слот с активными бронированиями' 
      });
    }

    const slot = await pool.query(
      'SELECT * FROM work_slots WHERE id = $1 AND master_id = $2',
      [slotId, masterId]
    );

    if (slot.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Рабочий слот не найден или у вас нет прав на его удаление' 
      });
    }

    await pool.query('DELETE FROM work_slots WHERE id = $1', [slotId]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Ошибка удаления рабочего слота:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;