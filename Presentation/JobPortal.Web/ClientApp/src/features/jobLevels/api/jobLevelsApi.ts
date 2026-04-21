import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { JobLevelDto } from '../../../types/api';

export const jobLevelsApi = createApi({
  reducerPath: 'jobLevelsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['JobLevel'],
  endpoints: (builder) => ({
    getJobLevels: builder.query<JobLevelDto[], void>({
      query: () => '/job-levels',
      providesTags: ['JobLevel'],
    }),
    createJobLevel: builder.mutation<JobLevelDto, { name: string }>({
      query: (body) => ({ url: '/job-levels', method: 'POST', body }),
      invalidatesTags: ['JobLevel'],
    }),
    updateJobLevel: builder.mutation<JobLevelDto, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/job-levels/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['JobLevel'],
    }),
    deleteJobLevel: builder.mutation<void, number>({
      query: (id) => ({ url: `/job-levels/${id}`, method: 'DELETE' }),
      invalidatesTags: ['JobLevel'],
    }),
  }),
});

export const {
  useGetJobLevelsQuery,
  useCreateJobLevelMutation,
  useUpdateJobLevelMutation,
  useDeleteJobLevelMutation,
} = jobLevelsApi;
