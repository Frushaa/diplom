import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import styles from '../../pages/masterPage/MasterProfile.module.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingCalendar.css';

const BookingModal = ({ isOpen, onClose }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [workSlots, setWorkSlots] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [servicesRes, slotsRes] = await Promise.all([
          api.get('/services'),
          api.get('/schedule/work-slots')
        ]);
        
        setServices(servicesRes.data);
        setWorkSlots(slotsRes.data);
      } catch (err) {
        setError('Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleDateSelect = async (date) => {
    const slot = workSlots.find(s => new Date(s.date).toDateString() === date.toDateString());
    
    if (!slot) {
      setError('В этот день салон не работает');
      setSelectedDate(null);
      setSelectedTime(null);
      return;
    }

    setSelectedSlotId(slot.id);
    setSelectedDate(date);
    setError('');

    try {
      const response = await api.get(`/schedule/available-times/${slot.id}`);
        setAvailableTimes(response.data);
    } catch (err) {
      setError('Ошибка загрузки доступного времени');
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      await api.post('/bookings', {
        service_id: selectedService.id,
        work_slot_id: selectedSlotId,
        start_time: selectedTime.start,
        duration: 120
      });
      onClose();
    } catch (err) {
      setError('Ошибка при записи. Попробуйте другое время.');
    }
  };

  if (!isOpen) return null;

  return (
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
      ) : error ? (
        <div className={styles.error} style={{ color: '#dc2626', textAlign: 'center' }}>
          {error}
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
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedService(service)}
                >
                  <div className={styles.serviceMainInfo}>
                    <span className={styles.serviceName}>{service.title}</span>
                    <span className={styles.servicePriceTime}>
                      {service.price}₽ • {service.duration} мин
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
                  {availableTimes.map((time, index) => (
                    <button
                      key={index}
                      className={`${styles.timeSlot} ${
                        selectedTime?.start === time.start ? styles.selectedTime : ''
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {formatTimeDisplay(time)}
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
);
};

export default BookingModal;