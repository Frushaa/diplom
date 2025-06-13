const pool = require('../config/db');

function timeToMinutes(timeStr) {
  if (!timeStr) {
    console.error('Не передано время');
    return 0;
  }
  
  try {
    if (typeof timeStr === 'string') {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    } else if (timeStr?.hours !== undefined) {
      return timeStr.hours * 60 + (timeStr.minutes || 0);
    }
    return 0;
  } catch (e) {
    console.error('Ошибка конвертации времени:', timeStr, e);
    return 0;
  }
}

function intervalToMinutes(intervalStr) {
  if (typeof intervalStr === 'number') return intervalStr;
  
  if (typeof intervalStr === 'string' && intervalStr.includes(':')) {
    const [hours, minutes] = intervalStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  return parseInt(intervalStr) || 0;
}

function extractMinutesFromInterval(intervalStr) {
  const parts = intervalStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}


async function getWorkSlotDetails(workSlotId) {
  try {
    const slotResult = await pool.query(
      `SELECT start_time, end_time 
       FROM work_slots 
       WHERE id = $1`,
      [workSlotId]
    );

    if (slotResult.rows.length === 0) {
      throw new Error('Рабочий слот не найден');
    }

    return slotResult.rows[0];
  } catch (err) {
    console.error('Error in getWorkSlotDetails:', err);
    throw err;
  }
}

async function getBookingsForSlot(workSlotId) {
  try {
    const result = await pool.query(
      `SELECT 
         id,
         start_time, 
         duration,
         service_duration
       FROM bookings 
       WHERE work_slot_id = $1 AND status != 'canceled'`,
      [workSlotId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      start: row.start_time,
      duration: row.duration, 
      service_duration: row.service_duration 
    }));
  } catch (err) {
    console.error('Ошибка получения бронирований:', err);
    return [];
  }
}


async function checkTimeAvailability(workSlotId, startTime, durationMinutes) {
  const { start_time: slotStart, end_time: slotEnd } = await getWorkSlotDetails(workSlotId);
  const bookings = await getBookingsForSlot(workSlotId);

  const reqStart = timeToMinutes(startTime);
  const reqEnd = reqStart + durationMinutes;
  const slotStartMin = timeToMinutes(slotStart);
  const slotEndMin = timeToMinutes(slotEnd);

  if (reqStart < slotStartMin || reqEnd > slotEndMin) {
    return false;
  }

  const hasConflict = bookings.some(booking => {
    const bookStart = timeToMinutes(booking.start_time);
    const bookEnd = bookStart + booking.duration_minutes;
    
    return (
      (reqStart >= bookStart && reqStart < bookEnd) || 
      (reqEnd > bookStart && reqEnd <= bookEnd) ||    
      (reqStart <= bookStart && reqEnd >= bookEnd)    
    );
  });

  return !hasConflict;
}

module.exports = {
  getWorkSlotDetails,
  getBookingsForSlot,
  checkTimeAvailability,
  timeToMinutes,
  intervalToMinutes,
  extractMinutesFromInterval
};