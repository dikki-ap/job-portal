import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { CandidateProfileDto } from '../../../types/api';

interface UpsertProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  educationLevelId: number | null;
  educationMajorId: number | null;
  educationMajorCustom: string | null;
  institutionName: string | null;
  educationStartYear: number | null;
  educationEndYear: number | null;
}

interface UploadCvResult {
  documentId: number;
  originalFileName: string;
}

export const candidateProfileApi = createApi({
  reducerPath: 'candidateProfileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/candidate-profile',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['CandidateProfile'],
  endpoints: (builder) => ({
    getProfile: builder.query<CandidateProfileDto, void>({
      query: () => '',
      providesTags: ['CandidateProfile'],
    }),
    upsertProfile: builder.mutation<CandidateProfileDto, UpsertProfileRequest>({
      query: (body) => ({ url: '', method: 'PUT', body }),
      invalidatesTags: ['CandidateProfile'],
    }),
    getInstitutionSuggestions: builder.query<string[], string>({
      query: (q) => `/institutions?q=${encodeURIComponent(q)}`,
    }),
    uploadCv: builder.mutation<UploadCvResult, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/cv', method: 'POST', body: formData };
      },
      invalidatesTags: ['CandidateProfile'],
    }),
    removeCv: builder.mutation<void, void>({
      query: () => ({ url: '/cv', method: 'DELETE' }),
      invalidatesTags: ['CandidateProfile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpsertProfileMutation,
  useLazyGetInstitutionSuggestionsQuery,
  useUploadCvMutation,
  useRemoveCvMutation,
} = candidateProfileApi;
export type { UpsertProfileRequest };
