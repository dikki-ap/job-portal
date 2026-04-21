import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { EmploymentTypeDto } from '../../../types/api';

export const employmentTypesApi = createApi({
  reducerPath: 'employmentTypesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['EmploymentType'],
  endpoints: (builder) => ({
    getEmploymentTypes: builder.query<EmploymentTypeDto[], void>({
      query: () => '/employment-types',
      providesTags: ['EmploymentType'],
    }),
    createEmploymentType: builder.mutation<EmploymentTypeDto, { name: string }>({
      query: (body) => ({ url: '/employment-types', method: 'POST', body }),
      invalidatesTags: ['EmploymentType'],
    }),
    updateEmploymentType: builder.mutation<EmploymentTypeDto, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/employment-types/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['EmploymentType'],
    }),
    deleteEmploymentType: builder.mutation<void, number>({
      query: (id) => ({ url: `/employment-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['EmploymentType'],
    }),
  }),
});

export const {
  useGetEmploymentTypesQuery,
  useCreateEmploymentTypeMutation,
  useUpdateEmploymentTypeMutation,
  useDeleteEmploymentTypeMutation,
} = employmentTypesApi;
