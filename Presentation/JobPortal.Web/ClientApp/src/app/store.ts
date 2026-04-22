import { configureStore } from '@reduxjs/toolkit';
import { departmentsApi } from '../features/departments/api/departmentsApi';
import { skillsApi } from '../features/skills/api/skillsApi';
import { workModesApi } from '../features/workModes/api/workModesApi';
import { employmentTypesApi } from '../features/employmentTypes/api/employmentTypesApi';
import { jobCategoriesApi } from '../features/jobCategories/api/jobCategoriesApi';
import { jobLevelsApi } from '../features/jobLevels/api/jobLevelsApi';
import { currencyTypesApi } from '../features/currencyTypes/api/currencyTypesApi';
import { documentTypesApi } from '../features/documentTypes/api/documentTypesApi';
import { educationLevelsApi } from '../features/educationLevels/api/educationLevelsApi';
import { educationMajorsApi } from '../features/educationMajors/api/educationMajorsApi';
import { jobPostsApi } from '../features/jobPosts/api/jobPostsApi';
import { hiringTemplatesApi } from '../features/hiringTemplates/api/hiringTemplatesApi';

export const store = configureStore({
  reducer: {
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [skillsApi.reducerPath]: skillsApi.reducer,
    [workModesApi.reducerPath]: workModesApi.reducer,
    [employmentTypesApi.reducerPath]: employmentTypesApi.reducer,
    [jobCategoriesApi.reducerPath]: jobCategoriesApi.reducer,
    [jobLevelsApi.reducerPath]: jobLevelsApi.reducer,
    [currencyTypesApi.reducerPath]: currencyTypesApi.reducer,
    [documentTypesApi.reducerPath]: documentTypesApi.reducer,
    [educationLevelsApi.reducerPath]: educationLevelsApi.reducer,
    [educationMajorsApi.reducerPath]: educationMajorsApi.reducer,
    [jobPostsApi.reducerPath]: jobPostsApi.reducer,
    [hiringTemplatesApi.reducerPath]: hiringTemplatesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(departmentsApi.middleware)
      .concat(skillsApi.middleware)
      .concat(workModesApi.middleware)
      .concat(employmentTypesApi.middleware)
      .concat(jobCategoriesApi.middleware)
      .concat(jobLevelsApi.middleware)
      .concat(currencyTypesApi.middleware)
      .concat(documentTypesApi.middleware)
      .concat(educationLevelsApi.middleware)
      .concat(educationMajorsApi.middleware)
      .concat(jobPostsApi.middleware)
      .concat(hiringTemplatesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
