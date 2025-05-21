import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './RegisterPage.module.css';
import SimplifiedHeader from '../../components/Headers/SimplifiedHeader';
import { useAppDispatch } from '../../store/store';
import { login } from '../../store/slices/authSlice';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    general: ''
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validatePassword = (password) => password.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({
      ...prev,
      [name === 'password' ? 'password' : 'general']: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      setErrors({
        password: 'Пароль должен содержать минимум 6 символов',
        general: ''
      });
      return;
    }

    try {
      const response = await api.post('/auth/register', formData);

      dispatch(login({
        email: response.data.email,
        role: response.data.role,
        username: response.data.username
      }));
    setTimeout(() => navigate('/login'), 1500);

    } catch (error) {
    const backendErrors = error.response?.data?.errors || {};
    let errorMessage = 'Ошибка регистрации';
    
    if (backendErrors.email) {
      errorMessage = backendErrors.email;
    } else if (backendErrors.username) {
      errorMessage = backendErrors.username;
    }

      setErrors({
        password: '',
        general: errorMessage
      });
    }
  };

  return (
    <div className={styles.mainWrapper}>
      <SimplifiedHeader />
      <div className={styles.container}>
        <h2 className={styles.title}>Регистрация</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Имя пользователя:
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Пароль:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password && styles.inputError}`}
                required
              />
            </label>
            {errors.password && (
              <div className={styles.errorMessage}>
                {errors.password}
              </div>
            )}
          </div>

          {errors.general && (
            <div className={styles.generalError}>
              {errors.general}
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            Зарегистрироваться
          </button>
        </form>

        <p className={styles.loginLink}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;