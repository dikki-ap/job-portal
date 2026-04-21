import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { JobCategoryDto } from '../../../types/api';

export const jobCategoriesApi = createApi({
  reducerPath: 'jobCategoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['JobCategory'],
  endpoints: (builder) => ({
    getJobCategories: builder.query<JobCategoryDto[], void>({
      query: () => '/job-categories',
      providesTags: ['JobCategory'],
    }),
    createJobCategory: builder.mutation<JobCategoryDto, { name: string }>({
      query: (body) => ({ url: '/job-categories', method: 'POST', body }),
      invalidatesTags: ['JobCategory'],
    }),
    updateJobCategory: builder.mutation<JobCategoryDto, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/job-categories/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['JobCategory'],
    }),
    deleteJobCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/job-categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['JobCategory'],
    }),
  }),
});

export const {
  useGetJobCategoriesQuery,
  useCreateJobCategoryMutation,
  useUpdateJobCategoryMutation,
  useDeleteJobCategoryMutation,
} = jobCategoriesApi;
