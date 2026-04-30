import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { BrandingConfig } from '../../../contexts/BrandingContext';

export const brandingSettingsApi = createApi({
  reducerPath: 'brandingSettingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = keycloak.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBrandingSetting: builder.query<BrandingConfig, void>({
      query: () => 'app-settings/branding',
    }),
    updateBrandingSetting: builder.mutation<void, BrandingConfig>({
      query: (body) => ({
        url: 'app-settings/branding',
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const { useGetBrandingSettingQuery, useUpdateBrandingSettingMutation } = brandingSettingsApi;
