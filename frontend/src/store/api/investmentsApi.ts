import { flofiApi } from './flofiApi'

export const investmentsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getInvestments: build.query({
      query: () => '/api/investments',
      providesTags: ['Investments'],
    }),
    getTopAssets: build.query({
      query: () => '/api/investments/top-assets',
      providesTags: ['Investments'],
    }),
    addInvestment: build.mutation({
      query: (body) => ({
        url: '/api/investments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Investments'],
    }),
    deleteInvestment: build.mutation({
      query: (id: number) => ({
        url: `/api/investments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Investments'],
    }),
  }),
})

export const {
  useGetInvestmentsQuery,
  useGetTopAssetsQuery,
  useAddInvestmentMutation,
  useDeleteInvestmentMutation,
} = investmentsApi
