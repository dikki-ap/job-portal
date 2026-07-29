import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationAnalyticsDto } from '../../../types/api';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/analytics',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getApplicationsForAnalytics: builder.query<ApplicationAnalyticsDto[], void>({
      query: () => '/applications',
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useGetApplicationsForAnalyticsQuery } = analyticsApi;
