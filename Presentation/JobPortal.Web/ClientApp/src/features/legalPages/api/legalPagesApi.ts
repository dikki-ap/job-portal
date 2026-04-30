import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';

interface LegalPageDto {
  content: string;
}

export const legalPagesApi = createApi({
  reducerPath: 'legalPagesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/app-settings/legal/',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['LegalPage'],
  endpoints: (builder) => ({
    getLegalPage: builder.query<LegalPageDto, 'privacy' | 'terms'>({
      query: (type) => type,
      providesTags: (_result, _error, type) => [{ type: 'LegalPage', id: type }],
    }),
    updateLegalPage: builder.mutation<void, { type: 'privacy' | 'terms'; content: string }>({
      query: ({ type, content }) => ({
        url: type,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { type }) => [{ type: 'LegalPage', id: type }],
    }),
  }),
});

export const { useGetLegalPageQuery, useUpdateLegalPageMutation } = legalPagesApi;
