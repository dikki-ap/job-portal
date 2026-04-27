import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { JobPostDto, ApplicationDto, PagedResult } from '../../../types/api';
import { applicationsApi } from '../../applications/api/applicationsApi';
import { myApplicationsApi } from '../../myApplications/api/myApplicationsApi';

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
    getCareerBySlug: builder.query<JobPostDto, string>({
      query: (slug) => `/${slug}`,
      providesTags: (_result, _err, slug) => [{ type: 'Career', id: slug }],
    }),
    applyToJob: builder.mutation<ApplicationDto, { jobPostId: number; documents: { documentId: number; documentTypeName: string }[] }>({
      query: ({ jobPostId, documents }) => ({
        url: `/${jobPostId}/apply`,
        method: 'POST',
        body: { documents },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(applicationsApi.util.invalidateTags(['Application']));
        dispatch(myApplicationsApi.util.invalidateTags(['MyApplication']));
      },
    }),
  }),
});

export const {
  useGetPublishedJobsQuery,
  useGetCareerByIdQuery,
  useGetCareerBySlugQuery,
  useApplyToJobMutation,
} = careersApi;
