const pool = require('../config/db');

class Booking {
  static async create({ client_id, service_id, work_slot_id }) {
    const result = await pool.query(
      `INSERT INTO bookings (client_id, service_id, work_slot_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [client_id, service_id, work_slot_id]
    );
    return result.rows[0];
  }

  static async findByClient(client_id) {
    const result = await pool.query(
      `SELECT b.*, s.title as service_title, ws.date, ws.start_time, ws.end_time 
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN work_slots ws ON b.work_slot_id = ws.id
       WHERE b.client_id = $1`,
      [client_id]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE bookings SET status = $1 
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }
}

module.exports = Booking;