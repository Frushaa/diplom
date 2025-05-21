import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import MasterHeader from '../../components/Headers/MasterHeader';
import ServicesSection from '../../components/masterComponents/ServicesSection';
import styles from './MasterProfile.module.css';
import { setServices } from '../../store/slices/servicesSlice';
import api from '../../services/api';

const MasterProfile = () => {
  const [activeModal, setActiveModal] = useState(null);
  const { services } = useAppSelector(state => state.services);
  const dispatch = useAppDispatch();

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
              onClick={action.handler}
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
            />
          </div>
        </div>
        )}

        <div className={styles.servicesSection}>
          <h3>Мои услуги</h3>
          <div className={styles.servicesList}>
            {services?.map(service => (
              <div key={service.id} className={styles.serviceItem}>
                <span>{service.title}</span>
                <span>{service.price}₽</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterProfile;