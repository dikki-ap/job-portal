import { configureStore } from '@reduxjs/toolkit';
import { departmentsApi } from '../features/departments/api/departmentsApi';

export const store = configureStore({
  reducer: {
    [departmentsApi.reducerPath]: departmentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(departmentsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
