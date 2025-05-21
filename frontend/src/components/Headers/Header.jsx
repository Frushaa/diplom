import { Link } from 'react-router-dom';
import styles from './header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          Nail World
        </Link>

        <div className={styles.centerNav}>
          <Link to="/about" className={styles.navLink}>
            О нас
          </Link>
          <Link to="/services" className={styles.navLink}>
            Услуги
          </Link>
          <Link to="/bookings" className={styles.navLink}>
            Запись
          </Link>
        </div>

        <div className={styles.authButtons}>
          <Link 
            to="/register" 
            className={`${styles.button} ${styles.registerButton}`}
          >
            Регистрация
          </Link>
          <Link 
            to="/login" 
            className={`${styles.button} ${styles.loginButton}`}
          >
            Вход
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;