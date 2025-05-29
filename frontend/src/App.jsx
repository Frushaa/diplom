import { useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/loginPage/LoginPage';
import RegisterPage from './pages/registerPage/RegisterPage';
import api from "./services/api";
import { useAppDispatch } from './store/store';
import { login } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import ClientProfile from './pages/clientPage/ClientProfile';
import MasterProfile from './pages/masterPage/MasterProfile';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profile');
          dispatch(login({
            ...response.data,
            token: token 
          }));
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={['client']} />}>
        <Route path="/client-profile" element={<ClientProfile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['master']} />}>
        <Route path="/master-profile" element={<MasterProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;