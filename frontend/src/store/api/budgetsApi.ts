import { flofiApi } from './flofiApi'

export const budgetsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getBudgetSummary: build.query({
      query: () => '/api/budgets/summary',
      providesTags: ['Budgets'],
    }),
    createBudget: build.mutation({
      query: (body: { categoryId: number; limitAmount: number; month?: string }) => ({
        url: '/api/budgets',
        method: 'POST',
        body,
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
