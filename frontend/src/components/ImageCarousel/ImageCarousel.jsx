import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './ImageCarousel.module.css';

const ImageCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    adaptiveHeight: true,
    pauseOnHover: true
  };

  const images = [
    '/images/ilyw00_4.jpg',
    '/images/sbef0_1.jpg',
    '/images/scuf11_7.jpg'
  ];

  return (
    <div className={styles.carouselContainer}>
      <Slider {...settings}>
        {images.map((img, index) => (
          <div key={index} className={styles.slide}>
            <img 
              src={img} 
              alt={`Слайд ${index + 1}`}
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageCarousel;