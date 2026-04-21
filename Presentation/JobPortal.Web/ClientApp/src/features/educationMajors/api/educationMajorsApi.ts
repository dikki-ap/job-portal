import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { EducationMajorDto } from '../../../types/api';

export const educationMajorsApi = createApi({
  reducerPath: 'educationMajorsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['EducationMajor'],
  endpoints: (builder) => ({
    getEducationMajors: builder.query<EducationMajorDto[], void>({
      query: () => '/education-majors',
      providesTags: ['EducationMajor'],
    }),
    createEducationMajor: builder.mutation<EducationMajorDto, { name: string }>({
      query: (body) => ({ url: '/education-majors', method: 'POST', body }),
      invalidatesTags: ['EducationMajor'],
    }),
    updateEducationMajor: builder.mutation<EducationMajorDto, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/education-majors/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['EducationMajor'],
    }),
    deleteEducationMajor: builder.mutation<void, number>({
      query: (id) => ({ url: `/education-majors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['EducationMajor'],
    }),
  }),
});

export const {
  useGetEducationMajorsQuery,
  useCreateEducationMajorMutation,
  useUpdateEducationMajorMutation,
  useDeleteEducationMajorMutation,
} = educationMajorsApi;
