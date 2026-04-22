import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { CandidateProfileDto, CandidateSkillDto } from '../../../types/api';

interface UpsertProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  educationLevelId: number | null;
  skills: { skillId: number; skillLevel: string }[];
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
  }),
});

export const { useGetProfileQuery, useUpsertProfileMutation } = candidateProfileApi;
export type { UpsertProfileRequest, CandidateSkillDto };
