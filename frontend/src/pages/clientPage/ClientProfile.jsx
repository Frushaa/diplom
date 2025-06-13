import { useAppSelector, useAppDispatch  } from '../../store/store';
import ClientHeader from '../../components/Headers/ClientHeader';
import { FaHistory, FaCalendarAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';
import ProfileSettings from './ProfileSettings';
import { useState } from 'react';
import UpcomingBookings from './bookingsTab/UpcomingBookings';
import styles from './ClientProfile.module.css';
import HistoryBookings from './HistoryBookings/HistoryBookings';
import { logout } from '../../store/slices/authSlice'; 
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ClientProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('bookings');

  const handleLogout = async () => {
    try {
      dispatch(logout()); 
      navigate('/login'); 
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    }
  };
  
  return (
    <div className={styles.profileContainer}>
      <ClientHeader />
      
      <div className={styles.profileContent}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h3>{user?.username}</h3>
            <p>{user?.email}</p>
          </div>
          
          <nav className={styles.sidebarNav}>
            <button 
              className={`${styles.navButton} ${activeTab === 'bookings' ? styles.active : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FaCalendarAlt /> Предстоящие записи
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory /> История записей
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> Настройки
            </button>
            <button 
              className={styles.navButton}
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Выйти
            </button>

          </nav>
        </aside>

        <main className={styles.mainContent}>
          {activeTab === 'history' && <HistoryBookings />}
          {activeTab === 'bookings' && <UpcomingBookings />}
          {activeTab === 'settings' && (
            <section className={styles.section}>
              <ProfileSettings />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientProfile;