import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';

export interface SmtpSettingDto {
  host: string;
  port: number;
  senderName: string;
  senderEmail: string;
  username: string;
  enableSsl: boolean;
  envOverrides: string[];
}

export interface UpdateSmtpSettingRequest {
  host: string;
  port: number;
  senderName: string;
  senderEmail: string;
  username: string;
  enableSsl: boolean;
}

export const smtpSettingsApi = createApi({
  reducerPath: 'smtpSettingsApi',
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
  tagTypes: ['SmtpSetting'],
  endpoints: (builder) => ({
    getSmtpSetting: builder.query<SmtpSettingDto, void>({
      query: () => '/app-settings/smtp',
      providesTags: ['SmtpSetting'],
    }),
    updateSmtpSetting: builder.mutation<void, UpdateSmtpSettingRequest>({
      query: (body) => ({ url: '/app-settings/smtp', method: 'PUT', body }),
      invalidatesTags: ['SmtpSetting'],
    }),
  }),
});

export const { useGetSmtpSettingQuery, useUpdateSmtpSettingMutation } = smtpSettingsApi;
