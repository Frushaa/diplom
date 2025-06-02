import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/loginPage/LoginPage';
import RegisterPage from './pages/registerPage/RegisterPage';
import api from "./services/api";
import { useAppDispatch } from './store/store';
import { login } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import ClientProfile from './pages/clientPage/ClientProfile';
import MasterProfile from './pages/masterPage/MasterProfile';
import { Element } from 'react-scroll';

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await api.get('/auth/profile');
        dispatch(login({ ...data, token }));
      } catch (error) {
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, [dispatch]);

  const isProtectedRoute = ['/client-profile', '/master-profile'].includes(location.pathname);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {isProtectedRoute && !localStorage.getItem('token') ? (
        <Route path="*" element={<Navigate to="/" replace />} />
      ) : (
        <>
          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path="/client-profile" element={<ClientProfile />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['master']} />}>
            <Route path="/master-profile" element={<MasterProfile />} />
          </Route>
        </>
      )}
    </Routes>
  );
}

export default App;