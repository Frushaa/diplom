import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../../../services/api';
import styles from '../bookingsTab/Bookings.module.css';

const HistoryBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/client/history');
        setBookings(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка загрузки истории записей');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) return <div className={styles.loading}>Загрузка истории...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.window}>
        <div className={styles.container}>
        <h2>История записей</h2>
        
        {bookings.length === 0 ? (
            <p className={styles.empty}>Нет записей в истории</p>
        ) : (
            <ul className={styles.list}>
            {bookings.map(booking => (
                <li key={booking.id} className={styles.item}>
                <div className={styles.header}>
                    <h3>{booking.service_title}</h3>
                    <span className={styles.price}>{booking.service_price}₽</span>
                    <span className={booking.record_type === 'upcoming' ? styles.upcomingBadge : styles.pastBadge}>
                    {booking.record_type === 'upcoming' ? 'Предстоящая' : 'Завершенная'}
                    </span>
                </div>
                
                <div className={styles.time}>
                    <span>
                    {format(new Date(booking.date), 'EEEE, d MMMM yyyy', { locale: ru })}
                    </span>
                    <span>
                    {booking.start_time}
                    </span>
                </div>
                
                {booking.record_type === 'upcoming'}
                </li>
            ))}
            </ul>
        )}
        </div>
    </div>
  );
};

export default HistoryBookings;