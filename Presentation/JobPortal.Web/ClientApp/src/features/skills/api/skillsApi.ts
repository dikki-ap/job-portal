import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { SkillDto } from '../../../types/api';

export const skillsApi = createApi({
  reducerPath: 'skillsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Skill'],
  endpoints: (builder) => ({
    getSkills: builder.query<SkillDto[], void>({
      query: () => '/skills',
      providesTags: ['Skill'],
    }),
    createSkill: builder.mutation<SkillDto, { name: string }>({
      query: (body) => ({ url: '/skills', method: 'POST', body }),
      invalidatesTags: ['Skill'],
    }),
    updateSkill: builder.mutation<SkillDto, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/skills/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['Skill'],
    }),
    deleteSkill: builder.mutation<void, number>({
      query: (id) => ({ url: `/skills/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Skill'],
    }),
  }),
});

export const {
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillsApi;
