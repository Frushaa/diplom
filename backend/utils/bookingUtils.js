const pool = require('../config/db');

async function getAvailableTimes(master_id, date, serviceDuration) {
  const workSlotResult = await pool.query(
    `SELECT id, date, start_time, end_time
     FROM work_slots
     WHERE master_id = $1 AND date = $2`,
    [master_id, date]
  );

  if (workSlotResult.rows.length === 0) return [];
  
  const { start_time, end_time } = workSlotResult.rows[0];
  
  const appointmentsResult = await pool.query(
    `SELECT start_time, duration 
     FROM bookings 
     WHERE master_id = $1 AND date = $2`,
    [master_id, date]
  );
  
  const allSlots = [];
  let current = new Date(`${date}T${start_time}`);
  const end = new Date(`${date}T${end_time}`);
  
  while (current < end) {
    allSlots.push({
      time: current.toTimeString().slice(0, 5),
      available: true
    });
    current.setMinutes(current.getMinutes() + 15);
  }
  
  appointmentsResult.rows.forEach(appointment => {
    const appStart = new Date(`${date}T${appointment.start_time}`);
    const appEnd = new Date(appStart);
    appEnd.setMinutes(appStart.getMinutes() + appointment.duration);
    
    allSlots.forEach(slot => {
      const slotTime = new Date(`${date}T${slot.time}`);
      if (slotTime >= appStart && slotTime < appEnd) {
        slot.available = false;
      }
    });
  });
  
  return allSlots.filter(slot => {
    if (!slot.available) return false;
    
    const slotStart = new Date(`${date}T${slot.time}`);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + serviceDuration);
    
    for (let t = new Date(slotStart); t < slotEnd; t.setMinutes(t.getMinutes() + 120)) {
      const timeStr = t.toTimeString().slice(0, 5);
      const slot = allSlots.find(s => s.time === timeStr);
      if (!slot || !slot.available) return false;
    }
    
    return true;
  }).map(slot => slot.time);
}

const calculateAvailableTimes = (slotStart, slotEnd, bookings, serviceDuration) => {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  const intervalDuration = 120;
  let availableTimes = [];
  
  for (let time = slotStartMinutes; time <= slotEndMinutes - intervalDuration; time += intervalDuration) {
    const timeStr = minutesToTime(time);
    const endTimeStr = minutesToTime(time + intervalDuration);
    
    const isAvailable = bookings.every(booking => {
      const bookingStart = timeToMinutes(booking.start_time);
      const bookingEnd = bookingStart + booking.duration;
      return time + intervalDuration <= bookingStart || time >= bookingEnd;
    });
    
    if (isAvailable) {
      availableTimes.push({
        start: timeStr,
        end: endTimeStr
      });
    }
  }
  
  return availableTimes;
};

async function checkTimeAvailability(workSlotId, startTime, duration) {
  try {
    const slotResult = await pool.query(
      'SELECT start_time, end_time FROM work_slots WHERE id = $1',
      [workSlotId]
    );
    
    if (slotResult.rows.length === 0) {
      throw new Error('Рабочий слот не найден');
    }

    const slot = slotResult.rows[0];
    const slotStart = new Date(`1970-01-01T${slot.start_time}Z`);
    const slotEnd = new Date(`1970-01-01T${slot.end_time}Z`);
    const requestedStart = new Date(`1970-01-01T${startTime}Z`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    
    if (requestedStart < slotStart || requestedEnd > slotEnd) {
      return false;
    }

    
    const bookingsResult = await pool.query(
      `SELECT start_time, duration FROM bookings 
       WHERE work_slot_id = $1 AND status != 'cancelled'`,
      [workSlotId]
    );

    for (const booking of bookingsResult.rows) {
      const bookingStart = new Date(`1970-01-01T${booking.start_time}Z`);
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
      
      if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
        return false;  
      }
    }

    return true;
  } catch (err) {
    console.error('Error in checkTimeAvailability:', err);
    throw err;
  }
}

module.exports = {
  getAvailableTimes, checkTimeAvailability
};