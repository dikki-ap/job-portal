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
import { applicationsApi } from '../features/applications/api/applicationsApi';
import { careersApi } from '../features/careers/api/careersApi';
import { documentsApi } from '../features/documents/api/documentsApi';
import { myApplicationsApi } from '../features/myApplications/api/myApplicationsApi';
import { candidateProfileApi } from '../features/candidateProfile/api/candidateProfileApi';
import { approvalLevelsApi } from '../features/approvalLevels/api/approvalLevelsApi';
import { approvalsApi } from '../features/approvals/api/approvalsApi';

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
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [careersApi.reducerPath]: careersApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
    [myApplicationsApi.reducerPath]: myApplicationsApi.reducer,
    [candidateProfileApi.reducerPath]: candidateProfileApi.reducer,
    [approvalLevelsApi.reducerPath]: approvalLevelsApi.reducer,
    [approvalsApi.reducerPath]: approvalsApi.reducer,
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
      .concat(hiringTemplatesApi.middleware)
      .concat(applicationsApi.middleware)
      .concat(careersApi.middleware)
      .concat(documentsApi.middleware)
      .concat(myApplicationsApi.middleware)
      .concat(candidateProfileApi.middleware)
      .concat(approvalLevelsApi.middleware)
      .concat(approvalsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
