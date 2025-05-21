import { Link } from 'react-router-dom';
import styles from './header.module.css';

const SimplifiedHeader = () => {
  return (
    <header className={styles.simplifiedHeader}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          Nail World
        </Link>
      </div>
    </header>
  );
};

export default SimplifiedHeader;