import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store/store';
import api from '../../services/api';
import styles from './ProfileSettings.module.css';
import { FaUser, FaPhone, FaEnvelope, FaCamera } from 'react-icons/fa';
import { updateUserData } from '../../store/slices/authSlice';

const ProfileSettings = () => {
  const dispatch = useAppDispatch();
  
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    phoneDisplay: '',
    avatar: null
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
  const loadProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      
      let phoneDisplay = '';
      if (data.phone) {
        const cleanPhone = data.phone.replace(/\D/g, '').slice(1);
        phoneDisplay = `+7 (${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6, 8)}-${cleanPhone.slice(8)}`;
      }
      
      setFormData({
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        phoneDisplay: phoneDisplay, 
        avatar: null
      });
      
      setPreviewAvatar(data.avatar || '/default-avatar.png');
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };
  
  loadProfile();
}, []);

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const input = e.target.value;
    const numbers = input.replace(/\D/g, '');
    let processedNumbers = numbers;
    if (numbers.length > 0) {
        if (numbers.startsWith('8')) {
        processedNumbers = '7' + numbers.slice(1);
        }
        else if (!numbers.startsWith('7')) {
        processedNumbers = '7' + numbers;
        }
    }
    const limitedNumbers = processedNumbers.slice(0, 11);
    let formattedValue = '';
    if (limitedNumbers.length > 0) {
        formattedValue = `+7 ${limitedNumbers.slice(1, 4)}${limitedNumbers.slice(4, 7)}${limitedNumbers.slice(7, 9)}${limitedNumbers.slice(9)}`;
    }
    
    setFormData(prev => ({
        ...prev,
        phone: '+7' + limitedNumbers.slice(1),
        phoneDisplay: formattedValue
    }));
    };

  const handlePhonePaste = (e) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text/plain');
  const numbers = pastedText.replace(/\D/g, '');
  
  let processed = numbers;
  if (numbers.startsWith('8')) {
    processed = '7' + numbers.slice(1);
  } else if (!numbers.startsWith('7')) {
    processed = '7' + numbers;
  }
  
  const limited = processed.slice(0, 11);
  setFormData(prev => ({
    ...prev,
    phone: '+7' + limited.slice(1),
    phoneDisplay: `+7 ${limited.slice(1, 4)} ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`
  }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const { data: userData } = await api.put('/auth/profile', {
      username: formData.username,
      email: formData.email,
      phone: formData.phone
    });

    if (formData.avatar) {
      const avatarFormData = new FormData();
      avatarFormData.append('avatar', formData.avatar);
      
      const { data: avatarData } = await api.put('/auth/profile/avatar', avatarFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      dispatch(updateUserData(avatarData));
    } else {
      dispatch(updateUserData(userData));
    }

    setSuccessMessage('Профиль успешно обновлен!');
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className={styles.settingsContainer}>
      <h2 className={styles.settingsTitle}>Настройки профиля</h2>
      
      <form onSubmit={handleSubmit} className={styles.settingsForm}>
        <div className={styles.avatarUpload}>
          <div className={styles.avatarPreview}>
            <img src={previewAvatar} alt="Аватар" className={styles.avatarImage} />
            <label className={styles.avatarEdit}>
              <FaCamera className={styles.cameraIcon} />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.avatarInput}
              />
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.inputLabel}>
            <FaUser className={styles.inputIcon} />
            <span>Имя пользователя</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={styles.textInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.inputLabel}>
            <FaEnvelope className={styles.inputIcon} />
            <span>Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.textInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.inputLabel}>
            <FaPhone className={styles.inputIcon} />
            <span>Номер телефона</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phoneDisplay}
            onChange={handleChange}
            onPaste={handlePhonePaste}
            className={styles.textInput}
            placeholder="+7 (XXX) XXX-XX-XX"
            maxLength={18}
            onFocus={(e) => {
                if (e.target.value === '') {
                e.target.value = '+7 (';
                setFormData(prev => ({ ...prev, phoneDisplay: '+7 ' }));
                }
            }}
            />
          {formData.phone && (
            <p className={styles.phoneHint}>
            Введите номер без +7 или 8 (только 11 цифр)
            </p>
          )}
        </div>

        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;