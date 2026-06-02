import { flofiApi } from './flofiApi'

export type BankAccountType = 'BANK' | 'DIGITAL_WALLET' | 'CASH' | 'CREDIT_CARD' | 'SAVINGS' | 'INVESTMENT'

export interface BankAccount {
  id: number
  userId: number
  name: string
  institution: string | null
  type: BankAccountType
  balance: number
  currency: string
  color: string | null
  icon: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AccountTransfer {
  id: number
  fromAccountId: number
  toAccountId: number
  amount: number
  description: string | null
  createdAt: string
  fromAccount: { id: number; name: string; icon: string | null; color: string | null }
}

export interface AccountsSummary {
  totalBalance: number
  activeCount: number
  archivedCount: number
  byType: Record<string, { count: number; total: number }>
}

export interface TransferRequest {
  fromAccountId: number
  toAccountId: number
  amount: number
  description?: string
}

export interface CreateAccountRequest {
  name: string
  institution?: string
  type: BankAccountType
  balance?: number
  currency?: string
  color?: string
  icon?: string
}

export interface UpdateAccountRequest {
  name?: string
  institution?: string
  type?: BankAccountType
  balance?: number
  currency?: string
  color?: string
  icon?: string
  isActive?: boolean
}

export const bankAccountsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getBankAccounts: build.query<BankAccount[], void>({
      query: () => '/api/bank-accounts',
      providesTags: ['BankAccounts'],
    }),
    getBankAccountsSummary: build.query<AccountsSummary, void>({
      query: () => '/api/bank-accounts/summary',
      providesTags: ['BankAccounts'],
    }),
    getBankAccountById: build.query<BankAccount, number>({
      query: (id) => `/api/bank-accounts/${id}`,
      providesTags: ['BankAccounts'],
    }),
    getTransferHistory: build.query<AccountTransfer[], void>({
      query: () => '/api/bank-accounts/transfers',
      providesTags: ['BankAccounts'],
    }),
    createBankAccount: build.mutation<BankAccount, CreateAccountRequest>({
      query: (body) => ({
        url: '/api/bank-accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankAccounts', 'Dashboard'],
    }),
    updateBankAccount: build.mutation<BankAccount, { id: number; data: UpdateAccountRequest }>({
      query: ({ id, data }) => ({
        url: `/api/bank-accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BankAccounts', 'Dashboard'],
    }),
    deleteBankAccount: build.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/api/bank-accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccounts', 'Dashboard'],
    }),
    transferBetweenAccounts: build.mutation<any, TransferRequest>({
      query: (body) => ({
        url: '/api/bank-accounts/transfer',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankAccounts', 'Dashboard'],
    }),
  }),
})

export const {
  useGetBankAccountsQuery,
  useGetBankAccountsSummaryQuery,
  useGetBankAccountByIdQuery,
  useGetTransferHistoryQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useTransferBetweenAccountsMutation,
} = bankAccountsApi
