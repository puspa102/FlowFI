import { flofiApi } from './flofiApi'

export const budgetsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getBudgetSummary: build.query({
      query: () => '/api/budgets/summary',
      providesTags: ['Budgets'],
    }),
    createBudget: build.mutation({
      query: (body: { categoryId: number; limit: number; period?: string }) => ({
        url: '/api/budgets',
        method: 'POST',
        body: { ...body, period: body.period ?? 'monthly' },
      }),
      invalidatesTags: ['Budgets', 'Dashboard'],
    }),
    deleteBudget: build.mutation({
      query: (id: number) => ({
        url: `/api/budgets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Budgets', 'Dashboard'],
    }),
    getBudgetSuggestions: build.query({
      query: () => '/api/insights/budget-suggestions',
      providesTags: ['Insights'],
    }),
  }),
})

export const {
  useGetBudgetSummaryQuery,
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetSuggestionsQuery,
} = budgetsApi
