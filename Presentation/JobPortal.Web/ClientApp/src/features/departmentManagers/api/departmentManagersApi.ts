import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '../../../lib/keycloak';
import type { DepartmentManagerDto, IsDepartmentManagerDto } from '../../../types/api';

interface DepartmentManagerInput {
  fullName: string;
  position: string;
  email: string;
  departmentIds: number[];
}

export const departmentManagersApi = createApi({
  reducerPath: 'departmentManagersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/department-managers',
    prepareHeaders: async (headers) => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(30);
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['DepartmentManager'],
  endpoints: (builder) => ({
    getDepartmentManagers: builder.query<DepartmentManagerDto[], void>({
      query: () => '',
      providesTags: ['DepartmentManager'],
    }),
    getDepartmentManagerById: builder.query<DepartmentManagerDto, number>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'DepartmentManager', id }],
    }),
    getIsDepartmentManager: builder.query<IsDepartmentManagerDto, void>({
      query: () => '/is-department-manager',
    }),
    createDepartmentManager: builder.mutation<DepartmentManagerDto, DepartmentManagerInput>({
      query: (body) => ({ url: '', method: 'POST', body }),
      invalidatesTags: ['DepartmentManager'],
    }),
    updateDepartmentManager: builder.mutation<DepartmentManagerDto, { id: number } & DepartmentManagerInput>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: ['DepartmentManager'],
    }),
    deleteDepartmentManager: builder.mutation<void, number>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DepartmentManager'],
    }),
  }),
});

export const {
  useGetDepartmentManagersQuery,
  useGetDepartmentManagerByIdQuery,
  useGetIsDepartmentManagerQuery,
  useCreateDepartmentManagerMutation,
  useUpdateDepartmentManagerMutation,
  useDeleteDepartmentManagerMutation,
} = departmentManagersApi;
