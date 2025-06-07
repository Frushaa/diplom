import { motion } from 'framer-motion';
import styles from './Notification.module.css';

const Notification = ({ message, onClose }) => {
  return (
    <motion.div
      className={styles.notification}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 0.9, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        <button onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
      </div>
    </motion.div>
  );
};

export default Notification;