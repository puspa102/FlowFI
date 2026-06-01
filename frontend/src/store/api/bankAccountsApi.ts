import { flofiApi } from './flofiApi'

export const bankAccountsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getBankConnections: build.query({
      query: () => '/api/bank-connections',
      providesTags: ['BankAccounts'],
    }),
    connectBankAccount: build.mutation({
      query: (body: { bankName: string; accountType: string; balance: number }) => ({
        url: '/api/bank-connections/connect',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankAccounts', 'Dashboard'],
    }),
    syncBankAccount: build.mutation({
      query: (id: number) => ({
        url: `/api/bank-connections/${id}/sync`,
        method: 'POST',
      }),
      invalidatesTags: ['BankAccounts', 'Dashboard'],
    }),
    disconnectBankAccount: build.mutation({
      query: (id: number) => ({
        url: `/api/bank-connections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccounts', 'Dashboard'],
    }),
  }),
})

export const {
  useGetBankConnectionsQuery,
  useConnectBankAccountMutation,
  useSyncBankAccountMutation,
  useDisconnectBankAccountMutation,
} = bankAccountsApi
