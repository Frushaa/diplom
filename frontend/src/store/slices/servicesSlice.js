import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  isLoading: false,
  error: null
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.services = action.payload;
    },
    addService: (state, action) => {
      state.services.push(action.payload);
    },
    servicesLoading: (state) => {
      state.isLoading = true;
    },
    servicesError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    removeServices: (state, action) => {
      state.services = state.services.filter(
        service => !action.payload.includes(service.id)
      );
    }
  }
});

export const { setServices, addService, removeServices } = servicesSlice.actions;
export default servicesSlice.reducer;