import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDto, PagedResult } from '../../../types/api';
import type { BulkOperationResult } from '../../applications/api/applicationsApi';

interface GetDepartmentApplicationsPagedParams {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

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
    getDepartmentApplicationsPaged: builder.query<PagedResult<ApplicationDto>, GetDepartmentApplicationsPagedParams>({
      query: ({ status, search, page = 1, pageSize = 20 } = {}) => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (search) params.set('search', search);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        return `/paged?${params.toString()}`;
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
    scheduleStep: builder.mutation<ApplicationDto, {
      applicationId: number; stepId: number;
      scheduledAt: string | null; scheduledLocation: string | null; scheduledNote: string | null;
    }>({
      query: ({ applicationId, stepId, scheduledAt, scheduledLocation, scheduledNote }) => ({
        url: `/${applicationId}/steps/${stepId}/schedule`,
        method: 'POST',
        body: { scheduledAt, scheduledLocation, scheduledNote },
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
  useGetDepartmentApplicationsPagedQuery,
  useGetDepartmentApplicationByIdQuery,
  usePassStepMutation,
  useFailStepMutation,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
  useRateDepartmentApplicationMutation,
  useScheduleStepMutation,
  useBulkUpdateStepMutation,
  useBulkAcceptMutation,
  useBulkRejectMutation,
} = departmentApplicationsApi;
