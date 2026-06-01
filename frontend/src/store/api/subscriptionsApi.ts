import { flofiApi } from './flofiApi'

export const subscriptionsApi = flofiApi.injectEndpoints({
  endpoints: (build) => ({
    getSubscriptions: build.query({
      query: () => '/api/subscriptions',
      providesTags: ['Subscriptions'],
    }),
    addSubscription: build.mutation({
      query: (body) => ({
        url: '/api/subscriptions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscriptions'],
    }),
    updateSubscription: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/subscriptions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Subscriptions'],
    }),
    cancelSubscription: build.mutation({
      query: (id: number) => ({
        url: `/api/subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscriptions'],
    }),
    getSubscriptionRecommendations: build.query({
      query: () => '/api/subscriptions/recommendations',
      providesTags: ['Insights'],
    }),
  }),
})

export const {
  useGetSubscriptionsQuery,
  useAddSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useGetSubscriptionRecommendationsQuery,
} = subscriptionsApi
