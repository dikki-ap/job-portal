import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { HiringTemplateDto } from "../../../types/api";
import keycloak from "../../../lib/keycloak";

interface StepRequest {
  name: string;
  isRequired: boolean;
}

interface CreateHiringTemplateRequest {
  name: string;
  description?: string | null;
  steps: StepRequest[];
}

interface UpdateHiringTemplateRequest extends CreateHiringTemplateRequest {
  id: number;
}

export const hiringTemplatesApi = createApi({
  reducerPath: "hiringTemplatesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/hiring-templates",
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set("Authorization", `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["HiringTemplate"],
  endpoints: (builder) => ({
    getHiringTemplates: builder.query<HiringTemplateDto[], void>({
      query: () => "",
      providesTags: ["HiringTemplate"],
    }),
    getHiringTemplateById: builder.query<HiringTemplateDto, number>({
      query: (id) => `/${id}`,
      providesTags: (_result, _err, id) => [{ type: "HiringTemplate", id }],
    }),
    createHiringTemplate: builder.mutation<
      HiringTemplateDto,
      CreateHiringTemplateRequest
    >({
      query: (body) => ({ url: "", method: "POST", body }),
      invalidatesTags: ["HiringTemplate"],
    }),
    updateHiringTemplate: builder.mutation<
      HiringTemplateDto,
      UpdateHiringTemplateRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { id, ...body },
      }),
      invalidatesTags: ["HiringTemplate"],
    }),
    deleteHiringTemplate: builder.mutation<void, number>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["HiringTemplate"],
    }),
  }),
});

export const {
  useGetHiringTemplatesQuery,
  useGetHiringTemplateByIdQuery,
  useCreateHiringTemplateMutation,
  useUpdateHiringTemplateMutation,
  useDeleteHiringTemplateMutation,
} = hiringTemplatesApi;
