import { flofiApi } from './flofiApi'

export const dashboardApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query({
      query: () => '/api/dashboard/summary',
      providesTags: ['Dashboard'],
    }),
    getDashboardAnalytics: build.query({
      query: () => '/api/dashboard/analytics',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardSummaryQuery, useGetDashboardAnalyticsQuery } = dashboardApi
