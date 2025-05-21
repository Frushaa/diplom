import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from '../../pages/masterPage/MasterProfile.module.css';

const BookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка бронирований
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await api.get('/api/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Ошибка загрузки бронирований:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBookings();
  }, []);

  // Изменение статуса бронирования
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { 
        status: newStatus 
      });
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      ));
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.section}>
      <h3>Текущие записи</h3>

      <div className={styles.bookingsList}>
        {bookings.map(booking => (
          <div key={booking.id} className={styles.bookingCard}>
            <div className={styles.bookingHeader}>
              <span className={styles.clientName}>
                {booking.client_name}
              </span>
              <span className={styles.bookingDate}>
                {new Date(booking.date).toLocaleDateString()} {booking.time}
              </span>
            </div>

            <div className={styles.bookingBody}>
              <div className={styles.serviceInfo}>
                <span>{booking.service_title}</span>
                <span>{booking.duration}</span>
                <span>{booking.price}₽</span>
              </div>

              <div className={styles.statusControl}>
                <select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="pending">Ожидание</option>
                  <option value="confirmed">Подтверждено</option>
                  <option value="completed">Завершено</option>
                  <option value="cancelled">Отменено</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsSection;