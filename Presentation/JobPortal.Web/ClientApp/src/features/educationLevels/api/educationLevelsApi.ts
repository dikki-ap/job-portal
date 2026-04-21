import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { EducationLevelDto } from '../../../types/api';

export const educationLevelsApi = createApi({
  reducerPath: 'educationLevelsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['EducationLevel'],
  endpoints: (builder) => ({
    getEducationLevels: builder.query<EducationLevelDto[], void>({
      query: () => '/education-levels',
      providesTags: ['EducationLevel'],
    }),
    createEducationLevel: builder.mutation<EducationLevelDto, { name: string; level: number }>({
      query: (body) => ({ url: '/education-levels', method: 'POST', body }),
      invalidatesTags: ['EducationLevel'],
    }),
    updateEducationLevel: builder.mutation<EducationLevelDto, { id: number; name: string; level: number }>({
      query: ({ id, ...body }) => ({ url: `/education-levels/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['EducationLevel'],
    }),
    deleteEducationLevel: builder.mutation<void, number>({
      query: (id) => ({ url: `/education-levels/${id}`, method: 'DELETE' }),
      invalidatesTags: ['EducationLevel'],
    }),
  }),
});

export const {
  useGetEducationLevelsQuery,
  useCreateEducationLevelMutation,
  useUpdateEducationLevelMutation,
  useDeleteEducationLevelMutation,
} = educationLevelsApi;
