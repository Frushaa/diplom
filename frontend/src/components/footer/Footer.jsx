import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaInstagram, FaVk, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaTelegram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerBrand}>
          <Link to="/" className={styles.footerLogo}>Nail World</Link>
          <p className={styles.footerDescription}>
            Профессиональный nail-сервис с 2020 года. 
            Делаем вас красивыми и уверенными в себе.
          </p>
          <div className={styles.socialLinks}>
            <a href="https://instagram.com" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://vk.com" aria-label="VK">
              <FaVk />
            </a>
            <a href="https://t.me/estrellita5272" aria-label="WhatsApp">
              <FaTelegram />
            </a>
          </div>
        </div>

        <div className={styles.footerNav}>
          <h3 className={styles.footerTitle}>Навигация</h3>
          <ul>
            <li><Link to="/about" className={styles.footerLink}>О нас</Link></li>
            <li><Link to="/services" className={styles.footerLink}>Услуги</Link></li>
            <li><Link to="/faq" className={styles.footerLink}>FAQ</Link></li>
            <li><Link to="/masters" className={styles.footerLink}>Мастера</Link></li>
            <li><Link to="/portfolio" className={styles.footerLink}>Портфолио</Link></li>
          </ul>
        </div>

        <div className={styles.footerContacts}>
          <h3 className={styles.footerTitle}>Контакты</h3>
          <ul>
            <li>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>г. Москва, ул. Примерная, 123</span>
            </li>
            <li>
              <FaPhoneAlt className={styles.contactIcon} />
              <a href="tel:+79995115058">+7 (999) 123-45-67</a>
            </li>
            <li>
              <FaEnvelope className={styles.contactIcon} />
              <a href="https://mail.google.com/mail/u/0/#inbox">info@nailworld.ru</a>
            </li>
          </ul>
        </div>

        <div className={styles.footerHours}>
          <h3 className={styles.footerTitle}>Часы работы</h3>
          <ul>
            <li>Пн-Пт: 10:00 - 21:00</li>
            <li>Сб-Вс: 10:00 - 20:00</li>
          </ul>
          <button className={styles.bookingButton}>Записаться онлайн</button>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>© {new Date().getFullYear()} Nail World. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;