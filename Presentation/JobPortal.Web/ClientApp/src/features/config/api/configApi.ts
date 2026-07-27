import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/config' }),
  endpoints: (builder) => ({
    getApplicationSources: builder.query<string[], void>({
      query: () => '/application-sources',
    }),
  }),
});

export const { useGetApplicationSourcesQuery } = configApi;
