import { flofiApi } from './flofiApi'

export const profileApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query({
      query: () => '/api/accounts/profile',
      providesTags: ['Profile'],
    }),
    updateSettings: build.mutation({
      query: (body) => ({
        url: '/api/accounts/settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const { useGetProfileQuery, useUpdateSettingsMutation } = profileApi
