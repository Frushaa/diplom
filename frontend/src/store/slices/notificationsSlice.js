import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  unreadCount: 0,
  notifications: []
};




const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount += action.payload;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map(n => ({
        ...n,
        is_read: true
      }));
      state.unreadCount = 0;
    },
  },
});

export const { 
  setUnreadCount, 
  updateUnreadCount,
  addNotification, 
  resetUnreadCount,
  setNotifications,
  markNotificationsAsRead
} = notificationsSlice.actions;

export default notificationsSlice.reducer;