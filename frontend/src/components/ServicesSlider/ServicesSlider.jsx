import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import api from '../../services/api';
import styles from './ServicesSlider.module.css';
import { FaClock } from 'react-icons/fa';

const ServicesSlider = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const formatDuration = (duration) => {
    if (typeof duration === 'string' && (duration.includes('мин') || duration.includes('час'))) {
      return duration;
    }
    
    const minutes = parseFloat(duration);
    
    if (isNaN(minutes)) return 'Длительность не указана';
    
    if (minutes === 30) return '30 минут';
    if (minutes === 60) return '1 час';
    if (minutes === 90) return '1.5 часа';
    if (minutes === 120) return '2 часа';
    
    if (minutes < 60) return `${minutes} минут`;
    
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours} часов` : `${hours} часа`;
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  if (loading) return <div className={styles.loading}>Загрузка услуг...</div>;

  return (
    <section className={styles.sliderSection}>
      <h2 className={styles.sectionTitle}>Наши услуги</h2>
      <div className={styles.sliderContainer}>
        <Slider {...settings}>
          {services.map((service) => (
            <div key={service.id} className={styles.serviceCard}>
              <h3>{service.title}</h3>
              <p className={styles.description}>{service.description}</p>
              <div className={styles.details}>
                <span>{service.price}₽</span>
                <span className={styles.duration}>
                  <FaClock className={styles.clockIcon} />
                  {formatDuration(service.duration)}
                </span>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ServicesSlider;