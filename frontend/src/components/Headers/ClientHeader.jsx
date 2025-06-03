import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import styles from './ClientHeader.module.css';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import api from '../../services/api';

const ClientHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        setNotificationsCount(data.count);
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
      }
    };
    
    fetchNotifications();
  }, []);

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
          <Link to="/client-profile/notifications" className={styles.navLink}>
            <div className={styles.iconWithBadge}>
              <FaBell className={styles.icon} />
              {notificationsCount > 0 && (
                <span className={styles.badge}>{notificationsCount}</span>
              )}
            </div>
          </Link>

          <div className={styles.userMenu}>
            <img 
              src={user?.avatar || '/default-avatar.png'} 
              alt={user?.username} 
              className={styles.avatar}
            />
            <span className={styles.userName}>{user?.username}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <FaSignOutAlt />
            </button>
        </nav>
      </div>
    </header>
  );
};

export default ClientHeader;