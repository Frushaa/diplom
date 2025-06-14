import styles from './HomePage.module.css';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import Header from '../../components/Headers/Header';
import ServicesSlider from '../../components/ServicesSlider/ServicesSlider';
import { Element } from 'react-scroll';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Footer from '../../components/footer/Footer';

const HomePage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const faqItems = [
    {
      question: "Как записаться на услугу?",
      answer: "Для записи на услугу, нужно авторизоваться. Перейдя в профиль, вы увидите кнопку записи"
    },
    {
      question: "Можно ли отменить или перенести запись?",
      answer: "Да, отмена или перенос возможны не позднее чем за 24 часа до назначенного времени."
    },
    {
      question: "Какие способы оплаты вы принимаете?",
      answer: "Мы принимаем наличные, банковские карты, а также электронные платежи через СБП."
    },
    {
      question: "Нужно ли приходить заранее перед записью?",
      answer: "Рекомендуем приходить за 5-10 минут до назначенного времени."
    },
    {
      question: "Что делать, если я опоздал(а) на запись?",
      answer: "При опоздании более чем на 15 минут ваша запись может быть отменена, так как мы должны соблюдать график работы мастеров."
    },
    {
      question: "Какие меры безопасности у вас приняты?",
      answer: "Мы строго соблюдаем все санитарные нормы: используем одноразовые инструменты, стерилизаторы и антисептики."
    },
    {
      question: "Можно ли привести ребенка на процедуру?",
      answer: "Да, мы предоставляем услуги для детей от 12 лет в сопровождении взрослых. Для детей младшего возраста - только детский маникюр."
    }
  ];

  return (
    <div className={styles.container}>
      <Header />
      <ImageCarousel style={{ display: 'flex' }}/>
      
      <main className={styles.mainContent}>
        <div className='Elements'>
        <Element name="about">
        <section className={styles.aboutSection}>
          <div className={styles.aboutContent}>
            <h2 className={styles.sectionTitle}>Немного о нашем салоне</h2>
            <div className={styles.aboutText}>
              <p>
                Nail World - это современный салон красоты, где работают настоящие профессионалы 
                своего дела. Мы предлагаем качественные услуги маникюра
                с 2015 года.
              </p>
              <p>
                Наша миссия - делать вас красивыми и уверенными в себе. Мы используем только 
                профессиональные материалы и следим за последними тенденциями в индустрии красоты.
              </p>
            </div>
            <div className={styles.aboutFeatures}>
              <div className={styles.featureCard}>
                <h3>500+</h3>
                <p>Довольных клиентов</p>
              </div>
              <div className={styles.featureCard}>
                <h3>5 лет</h3>
                <p>Опыта работы</p>
              </div>
            </div>
          </div>
          <div className={styles.aboutImage}>
            <img src="/images/xrab_5117.jpg" alt="Интерьер салона" />
          </div>
        </section>
        </Element>
        <div className='ServicesButton'>
        <Element name="services">
          <ServicesSlider />
        </Element>
        </div>
        <div className='FAQButtod'>
          <Element name="faq">
            <section className={styles.faqSection}>
              <div className={styles.faqHeader}>
                <h2 className={styles.sectionTitle}>FAQ</h2>
                <p className={styles.sectionSubtitle}>Ответы на популярные вопросы</p>
              </div>
              
              <div className={styles.faqContainer}>
                {faqItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className={styles.faqQuestion}>
                      <h3>{item.question}</h3>
                      {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {activeIndex === index && (
                      <div className={styles.faqAnswer}>
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </Element>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;