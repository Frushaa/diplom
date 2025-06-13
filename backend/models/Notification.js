const pool = require('../config/db');

class Notification {
  static async create({ user_id, message, booking_id, type }) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message, booking_id, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, message, booking_id, type]
    );
    return result.rows[0];
  }

  static async findByUser(user_id, { limit = 10, offset = 0 } = {}) {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    return result.rows;
  }

  static async markAsRead(id) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async countUnread(user_id) {
    const result = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
        [user_id]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Notification;