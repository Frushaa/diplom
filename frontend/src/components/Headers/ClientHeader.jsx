import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import styles from './ClientHeader.module.css';
import { FaBell, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import { setUnreadCount, setNotifications, markNotificationsAsRead } from '../../store/slices/notificationsSlice';
import useWebSocket from '../../hooks/useWebSocket';
import api from '../../services/api';
import BookingModal from '../../components/BookingModal/BookingModal';
import { motion } from 'framer-motion';


const ClientHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { unreadCount = 0, notifications = [] } = useAppSelector(state => state.notifications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useWebSocket();

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: countData }, { data: notificationsData }] = await Promise.all([
          api.get('/notifications/unread-count'),
          api.get('/notifications')
        ]);
        
        dispatch(setUnreadCount(countData.count));
        dispatch(setNotifications(notificationsData));
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
      }
    };
    
    fetchData();
  }, [dispatch]);


  const handleNotificationsToggle = async () => {
    const newState = !isNotificationsOpen;
    setIsNotificationsOpen(newState);
    
    if (newState) {
      try {
        await api.patch('/notifications/mark-as-read');
        dispatch(markNotificationsAsRead());
      } catch (error) {
        console.error('Ошибка при обновлении статуса уведомлений:', error);
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Nail World
        </Link>
        
        <nav className={styles.nav}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={styles.bookingButton}
          >
            <FaPlus className={styles.bookingIcon} />
            Записаться на услугу
          </button>
          <div className={styles.notificationsWrapper}>
            <button 
              onClick={handleNotificationsToggle}
              className={styles.notificationsButton}
            >
              <div className={styles.notificationIcon}>
                <FaBell />
                {unreadCount > 0 && (
                  <motion.span 
                    className={styles.badge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
            </button>
            
            {isNotificationsOpen && (
              <div className={styles.notificationsDropdown}>
                <div className={styles.notificationsHeader}>
                  <h4>Уведомления</h4>
                </div>
                <div className={styles.notificationsList}>
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
                      >
                        <p>{notification.message}</p>
                        <small>
                          {new Date(notification.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noNotifications}>Нет уведомлений</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.userMenu}>
            <div className={styles.avatar}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className={styles.userName}>{user?.username} </span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt />
          </button>
        </nav>

        <BookingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </header>
  );
};

export default ClientHeader;