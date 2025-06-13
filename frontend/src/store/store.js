import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import servicesReducer from './slices/servicesSlice';
import notificationsReducer from './slices/notificationsSlice';
import overlayReducer from './slices/overlaySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    notifications: notificationsReducer,
    overlay: overlayReducer 
  }
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export default store;