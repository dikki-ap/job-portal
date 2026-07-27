import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDocumentDto, ApplicationDto } from '../../../types/api';

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
    getApplicationByCode: builder.query<ApplicationDto, string>({
      query: (code) => `/${code}`,
      providesTags: (_result, _err, code) => [{ type: 'Application', id: code }],
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
    rateApplication: builder.mutation<ApplicationDto, { applicationId: number; rating: number; note?: string }>({
      query: ({ applicationId, rating, note }) => ({
        url: `/${applicationId}/rate`,
        method: 'POST',
        body: { rating, note },
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: 'Application', id: applicationId },
        'Application',
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
      invalidatesTags: (_r, _e, { applicationId }) => [{ type: 'Application', id: applicationId }, 'Application'],
    }),
    uploadCompanyDocument: builder.mutation<
      ApplicationDocumentDto,
      { code: string; name: string; file: File }
    >({
      query: ({ code, name, file }) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file);
        return { url: `/${code}/company-documents`, method: 'POST', body: formData };
      },
      invalidatesTags: (_r, _e, { code }) => [{ type: 'Application', id: code }],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useGetApplicationByCodeQuery,
  usePassStepMutation,
  useFailStepMutation,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
  useBulkUpdateStepMutation,
  useBulkAcceptMutation,
  useBulkRejectMutation,
  useRateApplicationMutation,
  useScheduleStepMutation,
  useUploadCompanyDocumentMutation,
} = applicationsApi;
