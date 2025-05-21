import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import servicesReducer from './slices/servicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer
  }
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export default store;