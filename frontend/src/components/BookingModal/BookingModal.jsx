import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingCalendar.css';
import styles from './BookingModal.module.css';
import Notification from '../Notification/Notification';

const BookingModal = ({ isOpen, onClose }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [workSlots, setWorkSlots] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const canSubmit = selectedService && selectedDate && selectedTime;
  
  const processAvailableTimes = (slotData) => {
    if (!slotData || !slotData.slotStart || !slotData.slotEnd) {
      console.error('Invalid slot data');
      return [];
    }

    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes) => {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
    };

    const slotStart = timeToMinutes(slotData.slotStart);
    const slotEnd = timeToMinutes(slotData.slotEnd);
    const duration = 120;
    const bookings = slotData.bookings || [];

    let availableSlots = [];
    
    for (let time = slotStart; time + duration <= slotEnd; time += duration) {
      const isAvailable = !bookings.some(booking => {
        const bookingStart = timeToMinutes(booking.start_time || booking.start);
        const bookingDuration = booking.duration?.hours * 60 + 
                              (booking.duration?.minutes || 0) || 
                              booking.duration || 
                              120;
        const bookingEnd = bookingStart + bookingDuration;
        
        return time < bookingEnd && (time + duration) > bookingStart;
      });

      if (isAvailable) {
        availableSlots.push({
          start: minutesToTime(time),
          end: minutesToTime(time + duration),
          duration: duration
        });
      }
    }

    return availableSlots;
  };

  const isWorkDay = (date) => {
    return workSlots.some(slot => {
      const slotDate = new Date(slot.date);
      return (
        slotDate.getDate() === date.getDate() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTimeDisplay = (timeObj) => {
    return `${timeObj.start} - ${timeObj.end}`;
  };

  const formatDuration = (duration) => {
  // Если приходит число (90.000...) или строка с числом ("90.000...")
  const minutes = typeof duration === 'string' 
    ? parseFloat(duration)
    : Number(duration);
  
  if (minutes === 30) return '30 минут';
  if (minutes === 60) return '1 час';
  if (minutes === 90) return '1.5 часа';
  if (minutes === 120) return '2 часа';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0) {
    if (mins === 30) return `${hours}.5 часа`;
    if (mins === 0) return `${hours} час${hours > 1 ? 'а' : ''}`;
    return `${hours} час${hours > 1 ? 'а' : ''} ${mins} минут`;
  }
  
  return `${Math.round(minutes)} минут`;
};

  useEffect(() => {
  if (!isOpen) return;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [servicesRes, workSlotsRes] = await Promise.all([
          api.get('/services'),
          api.get('/schedule/work-slots') // Получаем рабочие слоты
        ]);
      
      setServices(servicesRes.data);
      setWorkSlots(workSlotsRes.data);
    } catch (err) {
      showNotificationMessage('Не удалось загрузить данные', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [isOpen]);


  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleDateSelect = async (date) => {
    const slot = workSlots.find(s => new Date(s.date).toDateString() === date.toDateString());

    if (!selectedService) {
      showNotificationMessage('Сначала выберите услугу', 'error');
      setSelectedDate(null);
      return;
    }
    
    if (!slot) {
      showNotificationMessage('В этот день салон не работает', 'error');
      setSelectedDate(null);
      setSelectedTime(null);
      return;
    }

    setSelectedSlotId(slot.id);
    setSelectedDate(date);

    try {
      const response = await api.get(`/bookings/available-slots/${slot.id}`);
      
      if (!response.data.bookings) {
        response.data.bookings = [];
      }

      const processedTimes = processAvailableTimes(response.data);
      setAvailableTimes(processedTimes);
      
      if (processedTimes.length === 0) {
        showNotificationMessage('На выбранную дату нет свободных слотов', 'error');
      }
    } catch (err) {
      console.error('Error:', err);
      showNotificationMessage('Ошибка при загрузке доступного времени', 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/bookings', {
        service_id: selectedService.id,
        work_slot_id: selectedSlotId,
        start_time: selectedTime.start,
        duration: 120
      });

      showNotificationMessage(
        `Запись подтверждена: ${selectedService.title} на ${selectedDate.toLocaleDateString()} в ${selectedTime.start}`,
        'success'
      );
      
      setTimeout(() => {
        onClose();
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
      }, 2000);
      
    } catch (err) {
      console.error('Booking failed:', err.response?.data);
      showNotificationMessage(
        err.response?.data?.error || 'Ошибка при записи. Возможно, время уже занято.',
        'error'
      );
    }
  };

  if (!isOpen) return null;

  console.log('Sample service data:', {
    id: services[0]?.id,
    title: services[0]?.title,
    duration: services[0]?.duration,
    formatted: formatDuration(services[0]?.duration)
  });

  return (
    <>
      {isOpen && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={styles.modalHeader}>
              <h3>Запись на услугу</h3>
              <button onClick={onClose} className={styles.closeButton}>
                <FaTimes />
              </button>
            </div>

            {isLoading ? (
              <div className={styles.loading}>
                <p>Загрузка данных...</p>
              </div>
            ) : (
              <div className={styles.bookingContainer}>
                <div className={styles.servicesSection}>
                  <h4>Выберите услугу:</h4>
                  <div className={styles.servicesList}>
                    {services.map(service => (
                      <motion.div
                        key={service.id}
                        className={`${styles.serviceItem} ${selectedService?.id === service.id ? styles.selectedItem : ''}`}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className={styles.serviceMainInfo}>
                          <span className={styles.serviceName}>{service.title}</span>
                          <span className={styles.servicePriceTime}>
                            {formatDuration(service.duration)} • {service.price}₽
                          </span>
                        </div>
                        {selectedService?.id === service.id && (
                          <FaCheck className={styles.checkIcon} />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className={styles.calendarSection}>
                  <h4>Выберите дату и время:</h4>
                  
                  <Calendar
                    onChange={handleDateSelect}
                    value={selectedDate}
                    tileClassName={({ date }) => 
                      isWorkDay(date) ? styles.workDayTile : styles.nonWorkDayTile
                    }
                    tileDisabled={({ date }) => !isWorkDay(date)}
                    minDate={new Date()}
                  />
                    
                  {selectedDate && availableTimes.length > 0 && (
                    <div className={styles.timeSelection}>
                      <h5>Доступное время:</h5>
                      <div className={styles.timeSlots}>
                          {availableTimes.map((slot, index) => (
                            <button
                              key={`${slot.start}-${slot.end}`}
                              className={`${styles.timeSlot} ${
                                selectedTime?.start === slot.start ? styles.selectedTime : ''
                              }`}
                              onClick={() => setSelectedTime(slot)}
                            >
                              {slot.start} - {slot.end}
                              <span className={styles.durationHint}>
                                ({Math.floor(slot.duration/60)}ч {slot.duration%60}мин)
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                    
                  {selectedTime && (
                    <div className={styles.confirmation}>
                      <p>
                        Вы хотите записаться на услугу <strong>{selectedService.title}</strong><br />
                        <strong>{selectedDate.toLocaleDateString()}</strong> в{' '}
                        <strong>{formatTimeDisplay(selectedTime)}</strong>
                      </p>
                      <button
                        className={styles.primaryButton}
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                      >
                        Подтвердить запись
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {showNotification && (
        <Notification 
          message={notificationMessage}
          type={notificationType}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default BookingModal;