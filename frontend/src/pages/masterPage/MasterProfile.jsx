import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setServices } from '../../store/slices/servicesSlice';
import { FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import styles from './MasterProfile.module.css';
import MasterHeader from '../../components/Headers/MasterHeader';
import ServicesSection from '../../components/masterComponents/ServicesSection';
import ScheduleSection from '../../components/masterComponents/ScheduleSection';

const MasterProfile = () => {
  const [activeModal, setActiveModal] = useState(null);
  const { services } = useAppSelector(state => state.services);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const dispatch = useAppDispatch();

  const toggleServiceSelection = useCallback((serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  }, []);

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

    const handleEditService = useCallback((service) => {
    console.log('Редактирование услуги:', service);
    setActiveModal('editService');
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get('/services');
        dispatch(setServices(response.data));
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
      }
    };
    loadServices();
  }, [dispatch]);

  const masterActions = [
    { 
      title: 'Добавить услугу',
      handler: () => setActiveModal('service')
    },
    {
      title: 'Создать рабочий слот',
      handler: () => setActiveModal('schedule')
    },
    {
      title: 'Просмотреть бронирования',
      handler: () => setActiveModal('bookings')
    }
  ];

  const formatDisplayDuration = (duration) => {
  if (typeof duration === 'string' && (duration.includes('час') || duration.includes('мин'))) {
    return duration;
  }
  
  const minutes = parseFloat(duration);
  
  if (minutes === 60) return '1 час';
  if (minutes === 30) return '30 минут';
  if (minutes === 90) return '1.5 часа';
  if (minutes === 120) return '2 часа';
  
  if (minutes >= 60) {
    const hours = minutes / 60;
    if (hours % 1 === 0) return `${hours} час`;
    return `${hours} часа`;
  }
  
  return `${minutes} минут`;
};


  return (
    <div className={styles.container}>
      <MasterHeader />
      
      <div className={styles.dashboard}>
        <h2 className={styles.greeting}>
          Добро пожаловать, {useAppSelector(state => state.auth.user?.name)}!
        </h2>
        <div className={styles.actionsGrid}>
          {masterActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setActiveModal(
                action.title === 'Добавить услугу' ? 'service' :
                action.title === 'Создать рабочий слот' ? 'schedule' :
                'bookings'
              )}
              className={styles.actionCard}
            >
              {action.title}
            </button>
          ))}
        </div>

        {activeModal === 'service' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <ServicesSection 
                isModal={true}
                onClose={() => setActiveModal(null)}
                isDeleteMode={isDeleteMode}
                selectedServices={selectedServices}
                onToggleService={toggleServiceSelection}
                onEditService={handleEditService}
            />
          </div>
        </div>
        )}

        {activeModal === 'schedule' && (
          <div 
            className={styles.modalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveModal(null);
              }
            }}
          >
            <div className={styles.modalContent}>
              <ScheduleSection onClose={() => setActiveModal(null)} />
            </div>
          </div>
        )}

        <div className={styles.servicesSection}>
          <div className={styles.sectionHeader}>
            <h3>Мои услуги</h3>
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
          
          <div className={styles.servicesGrid}>
            {services?.map(service => (
              <div 
                key={service.id} 
                className={`${styles.serviceCard} ${
                  selectedServices.includes(service.id) ? styles.selected : ''
                }`}
              >
                {isDeleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleServiceSelection(service.id)}
                    className={styles.serviceCheckbox}
                  />
                )}
                
                <div className={styles.cardContent}>
                  <h4 className={styles.serviceTitle}>{service.title}</h4>
                  <p className={styles.serviceDescription}>
                    {service.description || 'Описание не указано'}
                  </p>
                  
                  <div className={styles.serviceMeta}>
                    <span className={styles.price}>{service.price}₽</span>
                    <span className={styles.duration}>
                      {formatDisplayDuration(service.duration)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterProfile;