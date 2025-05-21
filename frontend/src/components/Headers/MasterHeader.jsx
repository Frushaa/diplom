import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import styles from './header.module.css';

const MasterHeader = () => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          Nail World
        </Link>
        
        <button 
          onClick={handleLogout}
          className={`${styles.button} ${styles.logoutButton}`}
        >
          Выйти
        </button>
      </nav>
    </header>
  );
};

export default MasterHeader;