import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { UploadDocumentResult } from '../../../types/api';

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/documents',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<UploadDocumentResult, { file: File; documentTypeId: number }>({
      query: ({ file, documentTypeId }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentTypeId', String(documentTypeId));
        return { url: '/upload', method: 'POST', body: formData };
      },
    }),
  }),
});

export const { useUploadDocumentMutation } = documentsApi;
