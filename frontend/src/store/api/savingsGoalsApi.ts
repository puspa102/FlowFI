import { flofiApi } from './flofiApi'

export const savingsGoalsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getSavingsGoals: build.query({
      query: () => '/api/savings-goals',
      providesTags: ['SavingsGoals'],
    }),
    createSavingsGoal: build.mutation({
      query: (body) => ({
        url: '/api/savings-goals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SavingsGoals', 'Dashboard'],
    }),
    contributeTo: build.mutation({
      query: ({ id, amount }: { id: number; amount: number }) => ({
        url: `/api/savings-goals/${id}/contribute`,
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['SavingsGoals', 'Dashboard'],
    }),
    deleteSavingsGoal: build.mutation({
      query: (id: number) => ({
        url: `/api/savings-goals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavingsGoals', 'Dashboard'],
    }),
  }),
})

export const {
  useGetSavingsGoalsQuery,
  useCreateSavingsGoalMutation,
  useContributeToMutation,
  useDeleteSavingsGoalMutation,
} = savingsGoalsApi
