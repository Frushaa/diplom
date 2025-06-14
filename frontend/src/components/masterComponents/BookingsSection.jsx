import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from '../../pages/masterPage/MasterProfile.module.css';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const BookingsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' или 'past'

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = {};
        if (filter === 'upcoming') params.upcoming = 'true';
        if (filter === 'past') params.history = 'true';
        
        const { data } = await api.get('/bookings/master', { params });
        setBookings(data);
      } catch (error) {
        console.error('Ошибка загрузки записей:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [filter]);

  if (isLoading) return <div className={styles.loading}>Загрузка записей...</div>;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Записи клиентов</h3>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filter === 'upcoming' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Предстоящие
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'past' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('past')}
          >
            Прошедшие
          </button>
        </div>
      </div>

      <div className={styles.bookingsContainer}>
        {bookings.length === 0 ? (
          <p className={styles.noBookings}>Нет записей</p>
        ) : (
          <table className={styles.bookingsTable}>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Услуга</th>
                <th>Дата и время</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.client_name}</td>
                  <td>{booking.service_title}</td>
                  <td>
                    {format(new Date(booking.date), 'EEEE, d MMMM yyyy', { locale: ru })} в {booking.start_time}
                  </td>
                  <td>{booking.price}₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BookingsTable;