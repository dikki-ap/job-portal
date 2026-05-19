import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApprovalStatusDto, JobPostDto, PendingApprovalDto } from '../../../types/api';
import { jobPostsApi } from '../../jobPosts/api/jobPostsApi';

export const approvalsApi = createApi({
  reducerPath: 'approvalsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PendingApproval', 'ApprovalStatus', 'JobPost'],
  endpoints: (builder) => ({
    getPendingApprovals: builder.query<PendingApprovalDto[], void>({
      query: () => '/approvals/pending',
      providesTags: ['PendingApproval'],
    }),
    isApprover: builder.query<boolean, void>({
      query: () => '/approvals/is-approver',
    }),
    getApprovalStatus: builder.query<ApprovalStatusDto | null, number>({
      query: (jobPostId) => `/approvals/${jobPostId}/approval-status`,
      providesTags: (_result, _err, id) => [{ type: 'ApprovalStatus', id }],
    }),
    getApprovalJobPost: builder.query<JobPostDto, number>({
      query: (jobPostId) => `/approvals/${jobPostId}/job-post`,
    }),
    submitForApproval: builder.mutation<void, number>({
      query: (jobPostId) => ({ url: `/job-posts/${jobPostId}/submit-approval`, method: 'POST' }),
      invalidatesTags: ['PendingApproval'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(jobPostsApi.util.invalidateTags(['JobPost']));
      },
    }),
    approveJobPost: builder.mutation<void, { jobPostId: number; comment?: string }>({
      query: ({ jobPostId, comment }) => ({
        url: `/approvals/${jobPostId}/approve`,
        method: 'POST',
        body: { comment: comment ?? null },
      }),
      invalidatesTags: ['PendingApproval', 'ApprovalStatus'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(jobPostsApi.util.invalidateTags(['JobPost']));
      },
    }),
    rejectJobPost: builder.mutation<void, { jobPostId: number; comment: string }>({
      query: ({ jobPostId, comment }) => ({
        url: `/approvals/${jobPostId}/reject`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: ['PendingApproval', 'ApprovalStatus'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(jobPostsApi.util.invalidateTags(['JobPost']));
      },
    }),
    cancelApproval: builder.mutation<void, number>({
      query: (jobPostId) => ({ url: `/job-posts/${jobPostId}/cancel-approval`, method: 'POST' }),
      invalidatesTags: ['PendingApproval', 'ApprovalStatus'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(jobPostsApi.util.invalidateTags(['JobPost']));
      },
    }),
  }),
});

export const {
  useGetPendingApprovalsQuery,
  useIsApproverQuery,
  useGetApprovalStatusQuery,
  useGetApprovalJobPostQuery,
  useSubmitForApprovalMutation,
  useApproveJobPostMutation,
  useRejectJobPostMutation,
  useCancelApprovalMutation,
} = approvalsApi;
