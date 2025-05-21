import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from '../../pages/masterPage/MasterProfile.module.css';

const ScheduleSection = () => {
  const [workSlots, setWorkSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ 
    date: '', 
    start_time: '', 
    end_time: '' 
  });

  useEffect(() => {
    const loadWorkSlots = async () => {
      try {
        const response = await api.get('/schedule/work-slots');
        setWorkSlots(response.data);
      } catch (error) {
        console.error('Ошибка загрузки слотов:', error);
      }
    };
    loadWorkSlots();
  }, []);

  const handleCreateSlot = async () => {
    try {
      const response = await api.post('/schedule/work-slots', newSlot);
      setWorkSlots([...workSlots, response.data]);
      setNewSlot({ date: '', start_time: '', end_time: '' });
    } catch (error) {
      console.error('Ошибка создания слота:', error);
    }
  };

  return (
    <div className={styles.section}>
      <h3>Управление расписанием</h3>
      
      <div className={styles.formGroup}>
        <label>Дата:</label>
        <input
          type="date"
          value={newSlot.date}
          onChange={e => setNewSlot({...newSlot, date: e.target.value})}
        />
      </div>

      <div className={styles.timeInputs}>
        <div className={styles.formGroup}>
          <label>Начало:</label>
          <input
            type="time"
            value={newSlot.start_time}
            onChange={e => setNewSlot({...newSlot, start_time: e.target.value})}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Конец:</label>
          <input
            type="time"
            value={newSlot.end_time}
            onChange={e => setNewSlot({...newSlot, end_time: e.target.value})}
          />
        </div>
      </div>

      <button 
        className={styles.primaryButton}
        onClick={handleCreateSlot}
      >
        Добавить рабочий слот
      </button>

      <div className={styles.slotsContainer}>
        {workSlots.map(slot => (
          <div key={slot.id} className={styles.slotCard}>
            <div className={styles.slotHeader}>
              <span>{new Date(slot.date).toLocaleDateString()}</span>
              <span>{slot.start_time} - {slot.end_time}</span>
            </div>
            <div className={styles.slotBody}>
              {/* Можно добавить breaks */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection;