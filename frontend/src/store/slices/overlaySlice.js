import { createSlice } from '@reduxjs/toolkit';

const overlaySlice = createSlice({
  name: 'overlay',
  initialState: {
    errors: false,
    warnings: false
  },
  reducers: {
    updateOverlayState: (state, action) => {
      state.errors = action.payload.errors;
      state.warnings = action.payload.warnings;
    }
  }
});

export const { updateOverlayState } = overlaySlice.actions;
export default overlaySlice.reducer;