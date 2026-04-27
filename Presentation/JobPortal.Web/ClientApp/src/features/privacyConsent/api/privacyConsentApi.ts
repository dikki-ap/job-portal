import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';

interface PrivacyConsentSettingDto {
  requireConsent: boolean;
}

interface ConsentStatusDto {
  hasConsented: boolean;
  consentedAt: string | null;
}

export const privacyConsentApi = createApi({
  reducerPath: 'privacyConsentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ConsentSetting', 'ConsentStatus'],
  endpoints: (builder) => ({
    getPrivacyConsentSetting: builder.query<PrivacyConsentSettingDto, void>({
      query: () => '/app-settings/require-privacy-consent',
      providesTags: ['ConsentSetting'],
    }),
    updatePrivacyConsentSetting: builder.mutation<void, { requireConsent: boolean }>({
      query: (body) => ({ url: '/app-settings/require-privacy-consent', method: 'PUT', body }),
      invalidatesTags: ['ConsentSetting'],
    }),
    getMyConsentStatus: builder.query<ConsentStatusDto, void>({
      query: () => '/privacy-consent/status',
      providesTags: ['ConsentStatus'],
    }),
    recordConsent: builder.mutation<ConsentStatusDto, void>({
      query: () => ({ url: '/privacy-consent', method: 'POST' }),
      invalidatesTags: ['ConsentStatus'],
    }),
  }),
});

export const {
  useGetPrivacyConsentSettingQuery,
  useUpdatePrivacyConsentSettingMutation,
  useGetMyConsentStatusQuery,
  useRecordConsentMutation,
} = privacyConsentApi;
export type { PrivacyConsentSettingDto, ConsentStatusDto };
