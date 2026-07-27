import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDto } from '../../../types/api';
import type { BulkOperationResult } from '../../applications/api/applicationsApi';

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

    passStep: builder.mutation<ApplicationDto, { applicationId: number; stepId: number }>({
      query: ({ applicationId, stepId }) => ({
        url: `/${applicationId}/steps/${stepId}/pass`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        'DepartmentApplication',
        { type: 'DepartmentApplication', id: applicationId },
      ],
    }),
    failStep: builder.mutation<ApplicationDto, { applicationId: number; stepId: number }>({
      query: ({ applicationId, stepId }) => ({
        url: `/${applicationId}/steps/${stepId}/fail`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        'DepartmentApplication',
        { type: 'DepartmentApplication', id: applicationId },
      ],
    }),
    acceptApplication: builder.mutation<ApplicationDto, number>({
      query: (id) => ({ url: `/${id}/accept`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        'DepartmentApplication',
        { type: 'DepartmentApplication', id },
      ],
    }),
    rejectApplication: builder.mutation<ApplicationDto, number>({
      query: (id) => ({ url: `/${id}/reject`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        'DepartmentApplication',
        { type: 'DepartmentApplication', id },
      ],
    }),
    rateDepartmentApplication: builder.mutation<
      ApplicationDto,
      { applicationId: number; rating: number; note?: string }
    >({
      query: ({ applicationId, rating, note }) => ({
        url: `/${applicationId}/rate`,
        method: 'POST',
        body: { rating, note },
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        'DepartmentApplication',
        { type: 'DepartmentApplication', id: applicationId },
      ],
    }),
    bulkUpdateStep: builder.mutation<
      BulkOperationResult,
      { applicationIds: number[]; action: 'Passed' | 'Failed' }
    >({
      query: (body) => ({ url: '/bulk-step', method: 'POST', body }),
      invalidatesTags: ['DepartmentApplication'],
    }),
    bulkAccept: builder.mutation<BulkOperationResult, { applicationIds: number[] }>({
      query: (body) => ({ url: '/bulk-accept', method: 'POST', body }),
      invalidatesTags: ['DepartmentApplication'],
    }),
    bulkReject: builder.mutation<BulkOperationResult, { applicationIds: number[] }>({
      query: (body) => ({ url: '/bulk-reject', method: 'POST', body }),
      invalidatesTags: ['DepartmentApplication'],
    }),
  }),
});

export const {
  useGetDepartmentApplicationsQuery,
  useGetDepartmentApplicationByIdQuery,
  usePassStepMutation,
  useFailStepMutation,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
  useRateDepartmentApplicationMutation,
  useBulkUpdateStepMutation,
  useBulkAcceptMutation,
  useBulkRejectMutation,
} = departmentApplicationsApi;
