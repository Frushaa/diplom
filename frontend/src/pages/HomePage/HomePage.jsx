import React from 'react';
import styles from './HomePage.module.css';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import Header from '../../components/Headers/Header'

const HomePage = () => {
  return (
    <div className={styles.container}>
      <Header />
      <ImageCarousel style={{ display: 'flex' }}/>
      
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Добро пожаловать в Nail World</h1>
      </main>
    </div>
  );
};
export default HomePage;