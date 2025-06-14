import { useAppSelector, useAppDispatch } from '../../store/store';
import MasterHeader from '../../components/Headers/ProfileHeader';
import { FaCalendarAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useState } from 'react';
import styles from './MasterProfile.module.css'; 
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import ServicesSection from '../../components/masterComponents/ServicesSection';
import ScheduleSection from '../../components/masterComponents/ScheduleSection';
import BookingsSection from '../../components/masterComponents/BookingsSection';
import api from '../../services/api';
import { useEffect } from 'react';
import { setServices } from '../../store/slices/servicesSlice';

const MasterProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('services'); // По умолчанию вкладка услуг

  const handleLogout = async () => {
    try {
      dispatch(logout()); 
      navigate('/login'); 
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    }
  };

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get('/services');
        dispatch(setServices(response.data));
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
      }
    };
    loadServices();
  }, [dispatch]);
  
  return (
    <div className={styles.profileContainer}>
      <MasterHeader />
      
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
              className={`${styles.navButton} ${activeTab === 'services' ? styles.active : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <FaCog /> Мои услуги
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'schedule' ? styles.active : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <FaCalendarAlt /> Расписание
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'bookings' ? styles.active : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FaCalendarAlt /> Записи клиентов
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
          {activeTab === 'services' && <ServicesSection />}
          {activeTab === 'schedule' && <ScheduleSection />}
          {activeTab === 'bookings' && <BookingsSection />}
        </main>
      </div>
    </div>
  );
};

export default MasterProfile;