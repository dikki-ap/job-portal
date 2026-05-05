import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDto } from '../../../types/api';

export const departmentApplicationsApi = createApi({
  reducerPath: 'departmentApplicationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/department-applications',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['DepartmentApplication'],
  endpoints: (builder) => ({
    getDepartmentApplications: builder.query<ApplicationDto[], { status?: string }>({
      query: ({ status } = {}) => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        const qs = params.toString();
        return qs ? `?${qs}` : '';
      },
      providesTags: ['DepartmentApplication'],
    }),
    getDepartmentApplicationById: builder.query<ApplicationDto, number>({
      query: (id) => `/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'DepartmentApplication', id }],
    }),
  }),
});

export const {
  useGetDepartmentApplicationsQuery,
  useGetDepartmentApplicationByIdQuery,
} = departmentApplicationsApi;
