import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { login } from '../../store/slices/authSlice';
import SimplifiedHeader from '../../components/Headers/SimplifiedHeader';
import styles from '../loginPage/LoginPage.module.css';
import { useDispatch } from 'react-redux';

const LoginPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      const profileResponse = await api.get('/auth/profile');
        dispatch(login({ 
        ...profileResponse.data, 
        token: response.data.token 
      }));
        navigate(profileResponse.data.role === 'master' ? '/master-profile' : '/client-profile');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ошибка входа';
        setError(errorMessage.includes('пароль') 
          ? 'Неверный email или пароль' 
          : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.mainWrapper}>
      <SimplifiedHeader />
      <div className={styles.container}>
        <h2 className={styles.title}>Вход в аккаунт</h2>
        
        {error && (
          <div className={styles.errorContainer}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={styles.input}
                placeholder="example@mail.com"
                required
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Пароль:
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </label>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className={styles.registerLink}>
          Ещё нет аккаунта?{' '}
          <Link to="/register" className={styles.link}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;