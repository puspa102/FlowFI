import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { clearToken } from '../slices/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('flofi_token')
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    api.dispatch(clearToken())
  }
  return result
}

export const flofiApi = createApi({
  reducerPath: 'flofiApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Dashboard',
    'Transactions',
    'Budgets',
    'Categories',
    'Investments',
    'BankAccounts',
    'Subscriptions',
    'Family',
    'SavingsGoals',
    'Profile',
    'Insights',
  ],
  endpoints: () => ({}),
})
