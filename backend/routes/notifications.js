const pool = require('../config/db'); 
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/roleMiddleware');
const Notification = require('../models/Notification');

router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.findByUser(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countUnread(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.patch('/mark-as-read', authenticate, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.markAsRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;