import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { JobPostDto } from '../../../types/api';

interface JobStepInput {
  name: string;
  isRequired: boolean;
  passEmailSubject?: string | null;
  passEmailBody?: string | null;
  failEmailSubject?: string | null;
  failEmailBody?: string | null;
}

interface CreateJobPostInput {
  title: string;
  description: string;
  city: string;
  country: string;
  departmentId: number;
  workModeId: number;
  employmentTypeId: number;
  jobCategoryId: number;
  jobLevelId: number;
  minEducationLevelId?: number | null;
  minExperienceYears: number;
  minSalary?: number | null;
  maxSalary?: number | null;
  isSalaryVisible: boolean;
  currencyTypeId?: number | null;
  quota: number;
  publishDate?: string | null;
  closeDate?: string | null;
  steps: JobStepInput[];
  requiredSkillIds: number[];
  preferredMajorIds: number[];
}

export const jobPostsApi = createApi({
  reducerPath: 'jobPostsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['JobPost'],
  endpoints: (builder) => ({
    getJobPosts: builder.query<JobPostDto[], void>({
      query: () => '/job-posts',
      providesTags: ['JobPost'],
    }),
    getJobPostById: builder.query<JobPostDto, number>({
      query: (id) => `/job-posts/${id}`,
      providesTags: ['JobPost'],
    }),
    createJobPost: builder.mutation<JobPostDto, CreateJobPostInput>({
      query: (body) => ({ url: '/job-posts', method: 'POST', body }),
      invalidatesTags: ['JobPost'],
    }),
    updateJobPost: builder.mutation<JobPostDto, { id: number } & CreateJobPostInput>({
      query: ({ id, ...body }) => ({ url: `/job-posts/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['JobPost'],
    }),
    deleteJobPost: builder.mutation<void, number>({
      query: (id) => ({ url: `/job-posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['JobPost'],
    }),
    publishJobPost: builder.mutation<void, number>({
      query: (id) => ({ url: `/job-posts/${id}/publish`, method: 'POST' }),
      invalidatesTags: ['JobPost'],
    }),
    closeJobPost: builder.mutation<void, number>({
      query: (id) => ({ url: `/job-posts/${id}/close`, method: 'POST' }),
      invalidatesTags: ['JobPost'],
    }),
  }),
});

export const {
  useGetJobPostsQuery,
  useGetJobPostByIdQuery,
  useCreateJobPostMutation,
  useUpdateJobPostMutation,
  useDeleteJobPostMutation,
  usePublishJobPostMutation,
  useCloseJobPostMutation,
} = jobPostsApi;
