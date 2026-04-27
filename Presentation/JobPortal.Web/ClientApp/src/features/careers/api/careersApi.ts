import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { JobPostDto, ApplicationDto, PagedResult } from '../../../types/api';
import { applicationsApi } from '../../applications/api/applicationsApi';
import { myApplicationsApi } from '../../myApplications/api/myApplicationsApi';

export interface PublishedJobsParams {
  search?: string;
  categoryIds?: number[];
  employmentTypeIds?: number[];
  workModeIds?: number[];
  countries?: string[];
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
      query: ({ search, categoryIds, employmentTypeIds, workModeIds, countries, page, pageSize }) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        categoryIds?.forEach((id) => params.append('categoryIds', String(id)));
        employmentTypeIds?.forEach((id) => params.append('employmentTypeIds', String(id)));
        workModeIds?.forEach((id) => params.append('workModeIds', String(id)));
        countries?.forEach((c) => params.append('countries', c));
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        return `?${params.toString()}`;
      },
      providesTags: ['Career'],
    }),
    getPublishedCountries: builder.query<string[], void>({
      query: () => '/countries',
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
  useGetPublishedCountriesQuery,
  useGetCareerByIdQuery,
  useGetCareerBySlugQuery,
  useApplyToJobMutation,
} = careersApi;
