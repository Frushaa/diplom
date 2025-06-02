const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { authenticate, checkRole } = require('../../middleware/roleMiddleware');
const { serviceSchema } = require('../../validators/serviceValidator');

router.get(
  '/',
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          title, 
          description, 
          price, 
          EXTRACT(EPOCH FROM duration)/60 AS duration
         FROM services`
      );

      res.json(result.rows);
      
    } catch (err) {
      console.error('Ошибка получения услуг:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

router.post(
  '/',
  authenticate,
  checkRole('master'),
  async (req, res) => {
    try {
      const { error } = serviceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { title, description, price, duration } = req.body;

      const result = await pool.query(
        `INSERT INTO services (master_id, title, description, price, duration)
         VALUES ($1, $2, $3, $4, $5::interval)
         RETURNING id, title, description, price, EXTRACT(EPOCH FROM duration)/60 AS minutes`,
        [req.user.id, title, description, price, duration]
      );

      const responseData = {
        ...result.rows[0],
        duration: result.rows[0].minutes
      };

      res.status(201).json(responseData);
      
    } catch (err) {
      console.error('Ошибка создания услуги:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
);

router.delete('/', 
  authenticate, 
  checkRole('master'), 
  async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = ANY($1) AND master_id = $2', 
      [req.body.ids, req.user.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления услуг' });
  }
});

module.exports = router;