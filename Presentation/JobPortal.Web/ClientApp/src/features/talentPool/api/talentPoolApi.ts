import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDto } from '../../../types/api';

export interface TalentPoolEntryDto {
  id: number;
  userId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  rating: number | null;
  ratingNote: string | null;
  originalJobTitle: string;
  originalApplicationId: number;
  originalApplicationCode: string;
  notes: string | null;
  addedAt: string;
  addedByName: string;
}

export const talentPoolApi = createApi({
  reducerPath: 'talentPoolApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/talent-pool',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['TalentPool'],
  endpoints: (builder) => ({
    getTalentPool: builder.query<TalentPoolEntryDto[], void>({
      query: () => '',
      providesTags: ['TalentPool'],
    }),
    addToTalentPool: builder.mutation<TalentPoolEntryDto, { applicationId: number; notes?: string }>({
      query: (body) => ({ url: '', method: 'POST', body }),
      invalidatesTags: ['TalentPool'],
    }),
    removeFromTalentPool: builder.mutation<void, number>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TalentPool'],
    }),
    reengageCandidate: builder.mutation<ApplicationDto, { id: number; jobPostId: number }>({
      query: ({ id, jobPostId }) => ({ url: `/${id}/reengage`, method: 'POST', body: { jobPostId } }),
      invalidatesTags: ['TalentPool'],
    }),
  }),
});

export const {
  useGetTalentPoolQuery,
  useAddToTalentPoolMutation,
  useRemoveFromTalentPoolMutation,
  useReengageCandidateMutation,
} = talentPoolApi;
