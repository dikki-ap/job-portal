import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { DocumentTypeDto } from '../../../types/api';

export const documentTypesApi = createApi({
  reducerPath: 'documentTypesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['DocumentType'],
  endpoints: (builder) => ({
    getDocumentTypes: builder.query<DocumentTypeDto[], void>({
      query: () => '/document-types',
      providesTags: ['DocumentType'],
    }),
    createDocumentType: builder.mutation<DocumentTypeDto, { name: string }>({
      query: (body) => ({ url: '/document-types', method: 'POST', body }),
      invalidatesTags: ['DocumentType'],
    }),
    updateDocumentType: builder.mutation<DocumentTypeDto, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/document-types/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['DocumentType'],
    }),
    deleteDocumentType: builder.mutation<void, number>({
      query: (id) => ({ url: `/document-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DocumentType'],
    }),
  }),
});

export const {
  useGetDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} = documentTypesApi;
