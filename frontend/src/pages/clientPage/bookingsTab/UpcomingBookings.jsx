import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../../../services/api';
import styles from './Bookings.module.css';

const UpcomingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/upcoming');
        setBookings(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка загрузки записей');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.window}>
      <div className={styles.container}>
        <h2 className={styles.title}>Предстоящие записи</h2>
        
        {bookings.length === 0 ? (
          <p className={styles.empty}>Нет предстоящих записей</p>
        ) : (
          <ul className={styles.list}>
            {bookings.map(booking => (
              <li key={booking.id} className={styles.item}>
                <div className={styles.header}>
                  <h3>{booking.service_title}</h3>
                  <span className={styles.price}>{booking.service_price}₽</span>
                </div>
                
                <div className={styles.time}>
                  <span>
                    {format(new Date(booking.date), 'EEEE, d MMMM yyyy', { locale: ru })} в {booking.start_time}
                  </span>
                </div>
                
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpcomingBookings;