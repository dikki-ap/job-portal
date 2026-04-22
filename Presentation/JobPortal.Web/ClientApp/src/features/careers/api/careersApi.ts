import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { JobPostDto, ApplicationDto, PagedResult } from '../../../types/api';

export interface PublishedJobsParams {
  search?: string;
  categoryId?: number;
  page: number;
  pageSize: number;
}

export const careersApi = createApi({
  reducerPath: 'careersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/careers',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Career'],
  endpoints: (builder) => ({
    getPublishedJobs: builder.query<PagedResult<JobPostDto>, PublishedJobsParams>({
      query: ({ search, categoryId, page, pageSize }) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (categoryId) params.set('categoryId', String(categoryId));
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        return `?${params.toString()}`;
      },
      providesTags: ['Career'],
    }),
    getCareerById: builder.query<JobPostDto, number>({
      query: (id) => `/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Career', id }],
    }),
    applyToJob: builder.mutation<ApplicationDto, { jobPostId: number; documentIds: number[] }>({
      query: ({ jobPostId, documentIds }) => ({
        url: `/${jobPostId}/apply`,
        method: 'POST',
        body: { documentIds },
      }),
    }),
  }),
});

export const {
  useGetPublishedJobsQuery,
  useGetCareerByIdQuery,
  useApplyToJobMutation,
} = careersApi;
