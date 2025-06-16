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

  static async findUpcomingByClient(client_id) {
  const currentDate = new Date();
  const currentTime = currentDate.toTimeString().slice(0, 8);
  
  const result = await pool.query(
    `SELECT 
       b.id,
       b.status,
       b.start_time,
       s.title as service_title, 
       s.price as service_price,
       ws.date
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN work_slots ws ON b.work_slot_id = ws.id
     WHERE b.client_id = $1
     AND (ws.date > $2 OR (ws.date = $2 AND b.start_time > $3))
     AND b.status != 'cancelled'
     ORDER BY ws.date, b.start_time`,
    [client_id, currentDate, currentTime]
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

  static async findByWorkSlot(workSlotId) {
    const result = await pool.query(
      `SELECT id, start_time, duration, status
      FROM bookings
      WHERE work_slot_id = $1 AND status != 'cancelled'
      ORDER BY start_time`,
      [workSlotId]
    );
    return result.rows;
  }

  static async cancel(id) {
    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled' 
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async findHistoryByClient(client_id) {
    console.log(`Executing query for client: ${client_id}`); 
    
    const result = await pool.query(
      `SELECT 
        b.id,
        b.status,
        b.start_time,
        s.title as service_title, 
        s.price as service_price,
        ws.date,
        ws.start_time as slot_start_time,
        CASE 
          WHEN ws.date < CURRENT_DATE OR (ws.date = CURRENT_DATE AND b.start_time < CURRENT_TIME) 
          THEN 'past' 
          ELSE 'upcoming' 
        END as record_type
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN work_slots ws ON b.work_slot_id = ws.id
      WHERE b.client_id = $1
      AND b.status != 'cancelled'
      ORDER BY ws.date DESC`,
      [client_id]
    );

    console.log(`Found ${result.rows.length} records`); // Логирование
    return result.rows;
  }
}
module.exports = Booking;