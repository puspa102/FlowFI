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
    uploadAvatar: build.mutation({
      query: (formData: FormData) => ({
        url: '/api/accounts/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const { useGetProfileQuery, useUpdateSettingsMutation, useUploadAvatarMutation } = profileApi
