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
    }
  }
});

export const { setServices, addService } = servicesSlice.actions;
export default servicesSlice.reducer;