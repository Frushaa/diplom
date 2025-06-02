import { useAppSelector } from '../../store/store';
import ProfileHeader from '../../components/Headers/ProfileHeader'
import styles from './ClientProfile.module.css'
import { Link } from 'react-router-dom';

const ClientProfile = () => {
  const { user } = useAppSelector(state => state.auth);

  return (
    <div className="profile-container">
      <ProfileHeader />

      <h1>Профиль клиента</h1>
      <div className="profile-info">
        <p>Имя: {user?.username}</p>
        <p>Email: {user?.email}</p>
      </div>
      <div className={styles.actionsSection}>
          <Link 
            to="/services" 
            className={`${styles.actionButton} ${styles.primaryButton}`}
          >
            Посмотреть услуги
          </Link>
          
          <Link 
            to="/bookings" 
            className={`${styles.actionButton} ${styles.secondaryButton}`}
          >
            Мои записи
          </Link>
        </div>

    </div>
  );
};

export default ClientProfile;