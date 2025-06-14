import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import styles from '../../pages/masterPage/MasterProfile.module.css';
import { FiTrash2, FiClock } from 'react-icons/fi';

const ScheduleSection = ({ onClose }) => {
  const [workSlots, setWorkSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ 
    date: '', 
    start_time: '09:00', 
    end_time: '18:00'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkSlots = async () => {
      try {
        const response = await api.get('/schedule/work-slots');
        setWorkSlots(response.data);
      } catch (error) {
        console.error('Ошибка загрузки слотов:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkSlots();
  }, []);

  const handleCreateSlot = useCallback(async () => {
  try {
    const response = await api.post('/schedule/work-slots', newSlot);
    setWorkSlots([...workSlots, response.data]);
    setNewSlot({ date: '', start_time: '09:00', end_time: '18:00' });
  } catch (error) {
    console.error('Ошибка создания слота:', error);
  }
}, [newSlot, workSlots]);

  const handleDeleteSlot = async (slotId) => {
    try {
      await api.delete(`/schedule/work-slots/${slotId}`);
      setWorkSlots(workSlots.filter(slot => slot.id !== slotId));
    } catch (error) {
      console.error('Ошибка удаления слота:', error);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.modalHeader}>
        <h3>Добавить рабочий слот</h3>
      </div>

      <div className={styles.serviceForm}>
        <div className={styles.formGroup}>
          <label>Дата:</label>
          <input
            type="date"
            value={newSlot.date}
            onChange={e => setNewSlot({...newSlot, date: e.target.value})}
            className={styles.input}
          />
        </div>

        <div className={styles.priceDuration}>
          <div className={styles.formGroup}>
            <label><FiClock /> Начало:</label>
            <input
              type="time"
              value={newSlot.start_time}
              onChange={e => setNewSlot({...newSlot, start_time: e.target.value})}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label><FiClock /> Конец:</label>
            <input
              type="time"
              value={newSlot.end_time}
              min={newSlot.start_time}
              onChange={e => setNewSlot({...newSlot, end_time: e.target.value})}
              className={styles.input}
            />
          </div>
        </div>

        <button
          onClick={handleCreateSlot}
          className={styles.primaryButton}
          disabled={!newSlot.date}
        >
          Добавить рабочий слот
        </button>
      </div>

      <div className={styles.servicesPanel}>
        <h4>Мои рабочие слоты</h4>
        {isLoading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : workSlots.length === 0 ? (
          <p className={styles.noItems}>Нет добавленных слотов</p>
        ) : (
          <div className={styles.servicesList}>
            {workSlots.map(slot => (
              <div key={slot.id} className={styles.serviceItem}>
                <div className={styles.serviceMainInfo}>
                  <span className={styles.serviceName}>
                    Дата: {new Date(slot.date).toLocaleDateString('ru-RU')}
                  </span>
                  <span className={styles.servicePriceTime}>
                    Время: {slot.start_time} - {slot.end_time}
                  </span>
                </div>
                <button 
                  onClick={() => handleDeleteSlot(slot.id)}
                  className={styles.actionButton}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleSection;