import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDto } from '../../../types/api';

export const myApplicationsApi = createApi({
  reducerPath: 'myApplicationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/my-applications',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MyApplication'],
  endpoints: (builder) => ({
    getMyApplications: builder.query<ApplicationDto[], void>({
      query: () => '',
      providesTags: ['MyApplication'],
    }),
    getMyApplicationByCode: builder.query<ApplicationDto, string>({
      query: (code) => `/${code}`,
      providesTags: (_result, _err, code) => [{ type: 'MyApplication', id: code }],
    }),
  }),
});

export const { useGetMyApplicationsQuery, useGetMyApplicationByCodeQuery } = myApplicationsApi;
