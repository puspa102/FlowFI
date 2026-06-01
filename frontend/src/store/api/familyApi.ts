import { flofiApi } from './flofiApi'

export const familyApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getFamilyMembers: build.query({
      query: () => '/api/family/members',
      providesTags: ['Family'],
    }),
    getFamilyBudgets: build.query({
      query: () => '/api/family/budgets',
      providesTags: ['Family'],
    }),
    getFamilyStats: build.query({
      query: () => '/api/family/stats',
      providesTags: ['Family'],
    }),
    inviteFamilyMember: build.mutation({
      query: (body: { email: string }) => ({
        url: '/api/family/invite',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Family'],
    }),
    createFamilyBudget: build.mutation({
      query: (body) => ({
        url: '/api/family/budgets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Family'],
    }),
  }),
})

export const {
  useGetFamilyMembersQuery,
  useGetFamilyBudgetsQuery,
  useGetFamilyStatsQuery,
  useInviteFamilyMemberMutation,
  useCreateFamilyBudgetMutation,
} = familyApi
