import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { CurrencyTypeDto } from '../../../types/api';

export const currencyTypesApi = createApi({
  reducerPath: 'currencyTypesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['CurrencyType'],
  endpoints: (builder) => ({
    getCurrencyTypes: builder.query<CurrencyTypeDto[], void>({
      query: () => '/currency-types',
      providesTags: ['CurrencyType'],
    }),
    createCurrencyType: builder.mutation<CurrencyTypeDto, { name: string; prefix: string }>({
      query: (body) => ({ url: '/currency-types', method: 'POST', body }),
      invalidatesTags: ['CurrencyType'],
    }),
    updateCurrencyType: builder.mutation<CurrencyTypeDto, { id: number; name: string; prefix: string }>({
      query: ({ id, ...body }) => ({ url: `/currency-types/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['CurrencyType'],
    }),
    deleteCurrencyType: builder.mutation<void, number>({
      query: (id) => ({ url: `/currency-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['CurrencyType'],
    }),
  }),
});

export const {
  useGetCurrencyTypesQuery,
  useCreateCurrencyTypeMutation,
  useUpdateCurrencyTypeMutation,
  useDeleteCurrencyTypeMutation,
} = currencyTypesApi;
