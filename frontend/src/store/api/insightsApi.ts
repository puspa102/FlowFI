import { flofiApi } from './flofiApi'

export const insightsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    chatWithAI: build.mutation({
      query: (body: { message: string; history: Array<{ type: string; content: string }> }) => ({
        url: '/api/insights/chat',
        method: 'POST',
        body,
      }),
    }),
    getAIPredictions: build.query({
      query: () => '/api/insights/ai-predictions',
      providesTags: ['Insights'],
    }),
    getAnomalies: build.query({
      query: () => '/api/insights/anomalies',
      providesTags: ['Insights'],
    }),
    getSpendingPatterns: build.query({
      query: () => '/api/insights/spending-patterns',
      providesTags: ['Insights'],
    }),
  }),
})

export const {
  useChatWithAIMutation,
  useGetAIPredictionsQuery,
  useGetAnomaliesQuery,
  useGetSpendingPatternsQuery,
} = insightsApi
