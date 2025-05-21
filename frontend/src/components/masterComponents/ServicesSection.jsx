import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import styles from '../../pages/masterPage/MasterProfile.module.css';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { addService, setServices } from '../../store/slices/servicesSlice';

const ServicesSection = ({ isModal = false, onClose }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const { services } = useAppSelector(state => state.services);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    duration: '60 минут'
  });
  const dispatch = useAppDispatch();

  const durationMapping = {
    '30 минут': '30 minutes',
    '1 час': '1 hour',
    '1.5 часа': '90 minutes', 
    '2 часа': '120 minutes'
  };

   const toggleServiceSelection = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await api.delete('/services', { data: { ids: selectedServices } });
      const response = await api.get('/services');
      dispatch(setServices(response.data));
      setSelectedServices([]);
      setIsDeleteMode(false);
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleCreateService = async () => {
    try {
      const backendDuration = durationMapping[newService.duration];
      const response = await api.post('/services', {
        ...newService,
        duration: backendDuration
      });
      
      dispatch(addService({
        ...response.data,
        duration: newService.duration
      }));

      setNewService({
        title: '',
        description: '',
        price: '',
        duration: '30 минут'
      });

      if (isModal && onClose) onClose();
      
    } catch (error) {
      console.error('Ошибка:', error.response?.data);
    }
  };

  const handleEditService = (service) => {
    console.log('Редактирование услуги:', service);
  };

  const handleDeleteService = (id) => {
    console.log('Удаление услуги с id:', id);
  };

  const formatDuration = (minutes) => {
    const mins = parseInt(minutes);
    if (mins === 30) return '30 минут';
    if (mins === 60) return '1 час';
    if (mins === 90) return '1.5 часа';
    if (mins === 120) return '2 часа';
    return `${mins} минут`;
  };

  return (
    <div className={`${styles.section} ${isModal ? styles.modalVersion : ''}`}>
      {isModal && (
        <div className={styles.modalHeader}>
          <h3>Добавить услугу</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
      )}

      <div className={styles.serviceForm}>
        <div className={styles.formGroup}>
          <label>Название услуги:</label>
          <input
            type="text"
            value={newService.title}
            onChange={e => setNewService({...newService, title: e.target.value})}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Описание:</label>
          <textarea
            value={newService.description}
            onChange={e => setNewService({...newService, description: e.target.value})}
          />
        </div>

        <div className={styles.priceDuration}>
          <div className={styles.formGroup}>
            <label>Цена (₽):</label>
            <input
              type="number"
              value={newService.price}
              onChange={e => setNewService({...newService, price: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Длительность:</label>
            <select
              value={newService.duration}
              onChange={e => setNewService({...newService, duration: e.target.value})}
            >
              <option value="30 минут">30 минут</option>
              <option value="1 час">1 час</option>
              <option value="1.5 часа">1.5 часа</option>
              <option value="2 часа">2 часа</option>
            </select>
          </div>
        </div>

        <button
          className={styles.primaryButton}
          onClick={handleCreateService}
        >
          Добавить услугу
        </button>
      </div>
      

      {!isModal && (
        <div className={styles.servicesPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Мои услуги</h3>
            
            {!isDeleteMode ? (
              <button 
                onClick={() => setIsDeleteMode(true)}
                className={styles.deleteModeButton}
              >
                <FiTrash2 /> Удалить
              </button>
            ) : (
              <div className={styles.deleteActions}>
                <button 
                  onClick={handleDeleteSelected}
                  disabled={selectedServices.length === 0}
                  className={styles.confirmDeleteButton}
                >
                  <FiCheck /> Удалить выбранные ({selectedServices.length})
                </button>
                <button 
                  onClick={() => {
                    setIsDeleteMode(false);
                    setSelectedServices([]);
                  }}
                  className={styles.cancelDeleteButton}
                >
                  <FiX /> Отмена
                </button>
              </div>
            )}
          </div>
          
          <motion.div className={styles.servicesList}>
            {services?.map(service => (
              <motion.div
                key={service.id}
                className={`${styles.serviceItem} ${
                  selectedServices.includes(service.id) ? styles.selectedItem : ''
                }`}
                whileHover={{ backgroundColor: '#f8fafc' }}
              >
                {isDeleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleServiceSelection(service.id)}
                    className={styles.serviceCheckbox}
                  />
                )}
                
                <div className={styles.serviceMainInfo}>
                  <span className={styles.serviceName}>{service.title}</span>
                  <span className={styles.servicePriceTime}>
                    {service.price}₽ • {formatDuration(service.duration)}
                  </span>
                </div>
                
                {!isDeleteMode && (
                  <div className={styles.serviceActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEditService(service)}
                    >
                      <FiEdit size={16} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ServicesSection;