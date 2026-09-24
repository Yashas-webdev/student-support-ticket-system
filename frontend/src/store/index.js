import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import ticketReducer from './ticketSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
  },
});

export default store;
