const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const { workSlotSchema } = require('../../validators/scheduleValidator');

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

router.get(
  '/work-slots',
  authenticate,
  checkRole('master'),
  async (req, res) => {
    try {
      const master_id = req.user.id;
      
      const result = await pool.query(
        `SELECT 
          id,
          date,
          start_time,
          end_time
         FROM work_slots
         WHERE master_id = $1
         ORDER BY date, start_time`,
        [master_id]
      );

      res.status(200).json(result.rows);

    } catch (err) {
      console.error('Ошибка:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

router.delete(
  '/work-slots/:id',
  authenticate,
  checkRole('master'),
  async (req, res) => {
    try {
      const slotId = req.params.id;
      const masterId = req.user.id;

      const slot = await pool.query(
        'SELECT * FROM work_slots WHERE id = $1 AND master_id = $2',
        [slotId, masterId]
      );

      if (slot.rows.length === 0) {
        return res.status(404).json({ error: 'Рабочий слот не найден или у вас нет прав на его удаление' });
      }

      await pool.query('DELETE FROM work_slots WHERE id = $1', [slotId]);

      res.sendStatus(204);
    } catch (err) {
      console.error('Ошибка удаления рабочего слота:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

module.exports = router;