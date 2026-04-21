import { configureStore } from '@reduxjs/toolkit';
import { departmentsApi } from '../features/departments/api/departmentsApi';
import { skillsApi } from '../features/skills/api/skillsApi';
import { workModesApi } from '../features/workModes/api/workModesApi';
import { employmentTypesApi } from '../features/employmentTypes/api/employmentTypesApi';
import { jobCategoriesApi } from '../features/jobCategories/api/jobCategoriesApi';
import { jobLevelsApi } from '../features/jobLevels/api/jobLevelsApi';

export const store = configureStore({
  reducer: {
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [skillsApi.reducerPath]: skillsApi.reducer,
    [workModesApi.reducerPath]: workModesApi.reducer,
    [employmentTypesApi.reducerPath]: employmentTypesApi.reducer,
    [jobCategoriesApi.reducerPath]: jobCategoriesApi.reducer,
    [jobLevelsApi.reducerPath]: jobLevelsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(departmentsApi.middleware)
      .concat(skillsApi.middleware)
      .concat(workModesApi.middleware)
      .concat(employmentTypesApi.middleware)
      .concat(jobCategoriesApi.middleware)
      .concat(jobLevelsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
