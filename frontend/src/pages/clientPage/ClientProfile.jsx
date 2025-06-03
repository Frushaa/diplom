import { useAppSelector } from '../../store/store';
import ClientHeader from '../../components/Headers/ClientHeader';
import styles from './ClientProfile.module.css';
import { FaHistory, FaCalendarAlt, FaStar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import ProfileSettings from './ProfileSettings';
import { useState } from 'react';

const ClientProfile = () => {
  const { user } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('bookings');
  
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
            <button className={`${styles.navButton} ${styles.active}`}>
              <FaHistory /> История записей
            </button>
            <button className={styles.navButton}>
              <FaCalendarAlt /> Предстоящие записи
            </button>
            <button className={styles.navButton}>
              <FaStar /> Избранные мастера
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> Настройки
            </button>
            <button className={styles.navButton}>
              <FaSignOutAlt /> Выйти
            </button>
          </nav>
        </aside>

        <main className={styles.mainContent}>
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