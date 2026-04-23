import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDto } from '../../../types/api';

interface GetApplicationsParams {
  jobPostId?: number;
  status?: string;
}

interface UpdateStepParams {
  applicationId: number;
  stepId: number;
}

export interface BulkOperationResult {
  succeeded: number;
  skipped: number;
  errors: string[];
}

interface BulkStepParams {
  applicationIds: number[];
  action: 'Passed' | 'Failed';
}

interface BulkIdsParams {
  applicationIds: number[];
}

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/applications',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Application'],
  endpoints: (builder) => ({
    getApplications: builder.query<ApplicationDto[], GetApplicationsParams>({
      query: ({ jobPostId, status } = {}) => {
        const params = new URLSearchParams();
        if (jobPostId != null) params.set('jobPostId', String(jobPostId));
        if (status) params.set('status', status);
        const qs = params.toString();
        return qs ? `?${qs}` : '';
      },
      providesTags: ['Application'],
    }),
    getApplicationById: builder.query<ApplicationDto, number>({
      query: (id) => `/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Application', id }],
    }),
    passStep: builder.mutation<ApplicationDto, UpdateStepParams>({
      query: ({ applicationId, stepId }) => ({
        url: `/${applicationId}/steps/${stepId}/pass`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, { applicationId }) => [
        { type: 'Application', id: applicationId },
        'Application',
      ],
    }),
    failStep: builder.mutation<ApplicationDto, UpdateStepParams>({
      query: ({ applicationId, stepId }) => ({
        url: `/${applicationId}/steps/${stepId}/fail`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, { applicationId }) => [
        { type: 'Application', id: applicationId },
        'Application',
      ],
    }),
    acceptApplication: builder.mutation<ApplicationDto, number>({
      query: (id) => ({ url: `/${id}/accept`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Application', id }, 'Application'],
    }),
    rejectApplication: builder.mutation<ApplicationDto, number>({
      query: (id) => ({ url: `/${id}/reject`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Application', id }, 'Application'],
    }),
    bulkUpdateStep: builder.mutation<BulkOperationResult, BulkStepParams>({
      query: (body) => ({ url: '/bulk-step', method: 'POST', body }),
      invalidatesTags: ['Application'],
    }),
    bulkAccept: builder.mutation<BulkOperationResult, BulkIdsParams>({
      query: (body) => ({ url: '/bulk-accept', method: 'POST', body }),
      invalidatesTags: ['Application'],
    }),
    bulkReject: builder.mutation<BulkOperationResult, BulkIdsParams>({
      query: (body) => ({ url: '/bulk-reject', method: 'POST', body }),
      invalidatesTags: ['Application'],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  usePassStepMutation,
  useFailStepMutation,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
  useBulkUpdateStepMutation,
  useBulkAcceptMutation,
  useBulkRejectMutation,
} = applicationsApi;
