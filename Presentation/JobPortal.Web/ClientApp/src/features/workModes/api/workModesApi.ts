import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { WorkModeDto } from '../../../types/api';

export const workModesApi = createApi({
  reducerPath: 'workModesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['WorkMode'],
  endpoints: (builder) => ({
    getWorkModes: builder.query<WorkModeDto[], void>({
      query: () => '/work-modes',
      providesTags: ['WorkMode'],
    }),
    createWorkMode: builder.mutation<WorkModeDto, { name: string }>({
      query: (body) => ({ url: '/work-modes', method: 'POST', body }),
      invalidatesTags: ['WorkMode'],
    }),
    updateWorkMode: builder.mutation<WorkModeDto, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/work-modes/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['WorkMode'],
    }),
    deleteWorkMode: builder.mutation<void, number>({
      query: (id) => ({ url: `/work-modes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['WorkMode'],
    }),
  }),
});

export const {
  useGetWorkModesQuery,
  useCreateWorkModeMutation,
  useUpdateWorkModeMutation,
  useDeleteWorkModeMutation,
} = workModesApi;
