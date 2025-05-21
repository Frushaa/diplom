const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const { workSlotSchema, breakSchema, availableSlotsSchema } = require('../../validators/scheduleValidator');

router.post(
  '/work-slots',
  authenticate,
  checkRole('master'),
  async (req, res) => {
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
  }
);

router.post(
  '/work-slots/:id/breaks',
  authenticate,
  checkRole('master'),
  async (req, res) => {
    try {
      const { error } = breakSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const work_slot_id = req.params.id;
      const { start_time, end_time } = req.body;

      const workSlot = await pool.query(
        'SELECT * FROM work_slots WHERE id = $1',
        [work_slot_id]
      );
      
      if (workSlot.rows.length === 0) {
        return res.status(404).json({ error: 'Рабочий слот не найден' });
      }

      if (start_time < workSlot.rows[0].start_time || end_time > workSlot.rows[0].end_time) {
        return res.status(400).json({ error: 'Перерыв выходит за пределы рабочего времени' });
      }

      const result = await pool.query(
        `INSERT INTO breaks (work_slot_id, start_time, end_time)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [work_slot_id, start_time, end_time]
      );

      res.status(201).json(result.rows[0]);

    } catch (err) {
      console.error('Ошибка:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

router.get(
    '/available-slots',
    async (req, res) => {
      try {
        const { service_id } = req.query;
        
        const service = await pool.query(
          'SELECT duration FROM services WHERE id = $1',
          [service_id]

        );
        console.log(service.rows[0].duration)
        if (!service.rows[0]) {
          return res.status(404).json({ error: 'Услуга не найдена' });
        }
        const duration = service.rows[0].duration;
        
        const workSlots = await pool.query(`
          SELECT ws.id, ws.date, ws.start_time, ws.end_time,
                 COALESCE(
                   json_agg(
                     json_build_object(
                       'start_time', b.start_time,
                       'end_time', b.end_time
                     ) ORDER BY b.start_time
                   ) FILTER (WHERE b.id IS NOT NULL),
                   '[]'
                 ) as breaks
          FROM work_slots ws
          LEFT JOIN breaks b ON ws.id = b.work_slot_id
          WHERE ws.date >= CURRENT_DATE
          GROUP BY ws.id
        `);
  
        const availableSlots = [];
        for (const slot of workSlots.rows) {
          const slotStart = timeToMinutes(slot.start_time);
          const slotEnd = timeToMinutes(slot.end_time);
          
          const breaks = slot.breaks.sort((a, b) => 
            timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
          );
  
          let lastEnd = slotStart;
          for (const br of breaks) {
            const breakStart = timeToMinutes(br.start_time);
            const breakEnd = timeToMinutes(br.end_time);
            
            if (breakStart > lastEnd) {
              availableSlots.push(...splitInterval(
                slot.date, 
                minutesToTime(lastEnd), 
                minutesToTime(breakStart),
                duration
              ));
            }
            lastEnd = breakEnd;
          }
  
          if (lastEnd < slotEnd) {
            availableSlots.push(...splitInterval(
              slot.date,
              minutesToTime(lastEnd),
              minutesToTime(slotEnd),
              duration
            ));
          }
        }
  
        res.json(availableSlots);
      } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
      }
    }
  );
  
  function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  function splitInterval(date, startTime, endTime, duration) {
    const interval = [];
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const durationMinutes = intervalToMinutes(duration);
    
    for (let time = start; time + durationMinutes <= end; time += durationMinutes) {
      interval.push({
        date,
        start_time: minutesToTime(time),
        end_time: minutesToTime(time + durationMinutes)
      });
    }
    return interval;
  }
  
  function intervalToMinutes(interval) {
    const parts = interval.split(' ');
    let total = 0;
    for (let i = 0; i < parts.length; i += 2) {
      const value = parseInt(parts[i]);
      const unit = parts[i + 1];
      total += value * (unit.startsWith('hour') ? 60 : 1);
    }
    return total;
  }

module.exports = router;