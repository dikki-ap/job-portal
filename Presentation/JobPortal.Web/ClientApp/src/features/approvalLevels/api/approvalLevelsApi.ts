import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApprovalLevelDto } from '../../../types/api';

interface ApprovalLevelInput {
  name: string;
  levelOrder: number;
  approverName: string;
  approverEmail: string;
  isActive: boolean;
}

export const approvalLevelsApi = createApi({
  reducerPath: 'approvalLevelsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/approval-levels',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ApprovalLevel'],
  endpoints: (builder) => ({
    getApprovalLevels: builder.query<ApprovalLevelDto[], void>({
      query: () => '',
      providesTags: ['ApprovalLevel'],
    }),
    createApprovalLevel: builder.mutation<ApprovalLevelDto, ApprovalLevelInput>({
      query: (body) => ({ url: '', method: 'POST', body }),
      invalidatesTags: ['ApprovalLevel'],
    }),
    updateApprovalLevel: builder.mutation<ApprovalLevelDto, { id: number } & ApprovalLevelInput>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['ApprovalLevel'],
    }),
    deleteApprovalLevel: builder.mutation<void, number>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ApprovalLevel'],
    }),
  }),
});

export const {
  useGetApprovalLevelsQuery,
  useCreateApprovalLevelMutation,
  useUpdateApprovalLevelMutation,
  useDeleteApprovalLevelMutation,
} = approvalLevelsApi;
