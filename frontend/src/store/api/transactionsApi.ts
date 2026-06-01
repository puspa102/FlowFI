import { flofiApi } from './flofiApi'

interface TransactionFilters {
  search?: string
  category?: string
  type?: string
  timeframe?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export const transactionsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getTransactions: build.query({
      query: (filters: TransactionFilters = {}) => {
        const params = new URLSearchParams()
        if (filters.search) params.append('search', filters.search)
        if (filters.category) params.append('category', filters.category)
        if (filters.type && filters.type !== 'ALL') params.append('type', filters.type)
        if (filters.timeframe && filters.timeframe !== 'ALL') params.append('timeframe', filters.timeframe)
        if (filters.startDate) params.append('startDate', filters.startDate)
        if (filters.endDate) params.append('endDate', filters.endDate)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
        return `/api/transactions?${params.toString()}`
      },
      providesTags: ['Transactions'],
    }),
    createTransaction: build.mutation({
      query: (body) => ({
        url: '/api/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transactions', 'Dashboard'],
    }),
    updateTransaction: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/transactions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Transactions', 'Dashboard'],
    }),
    deleteTransaction: build.mutation({
      query: (id: number) => ({
        url: `/api/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions', 'Dashboard'],
    }),
    smartCategorize: build.mutation({
      query: (body: { description: string }) => ({
        url: '/api/insights/smart-categorize',
        method: 'POST',
        body,
      }),
    }),
    getCategories: build.query({
      query: () => '/api/categories',
      providesTags: ['Categories'],
    }),
    createCategory: build.mutation({
      query: (body) => ({
        url: '/api/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories'],
    }),
    getAccounts: build.query({
      query: () => '/api/accounts',
    }),
  }),
})

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useSmartCategorizeMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetAccountsQuery,
} = transactionsApi
