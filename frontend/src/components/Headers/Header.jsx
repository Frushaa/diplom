import { Link } from 'react-router-dom';
import styles from './header.module.css';
import { useSelector } from 'react-redux';
import { scroller } from 'react-scroll';

const Header = () => {
  const { user } = useSelector(state => state.auth);
  const scrollToSection = (sectionId) => {
    scroller.scrollTo(sectionId, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -100
    });
  };


  return (
    <header className={styles.header}>
      <nav className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          Nail World
        </Link>

        <div className={styles.centerNav}>
          <button 
            onClick={() => scrollToSection('about')} 
            className={styles.navLink} 
          >
            О нас
          </button>
          <button 
            onClick={() => scrollToSection('services')} 
            className={styles.navLink}
          >
            Услуги
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className={styles.navLink}
          >
            FAQ
          </button>

        </div>

        {user ? (
          <Link 
            to={user.role === 'master' ? '/master-profile' : '/client-profile'}
            className={`${styles.button} ${styles.profileButton}`}
          >
            Мой профиль
          </Link>
        ) : (
          <div className={styles.authButtons}>
            <Link to="/register" className={`${styles.button} ${styles.registerButton}`}>
              Регистрация
            </Link>
            <Link to="/login" className={`${styles.button} ${styles.loginButton}`}>
              Вход
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};


export default Header;