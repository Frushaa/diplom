import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('authUser')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  role: localStorage.getItem('userRole') || null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    login(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.role = action.payload.role;
      
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('authUser', JSON.stringify(action.payload));
      localStorage.setItem('userRole', action.payload.role);
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;

      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userRole');
    }
  }
});

export const { login, logout, updateUserData} = authSlice.actions;
export default authSlice.reducer;