import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export const queryApi = createApi({
  reducerPath: "queryApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: any, { getState }: any) => {
      const token = getState().token
      headers.set("Accept", "application/json")
      headers.set("Content-Type", "application/json")
      headers.set("User-Role", "Adtivity App")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      // console.log(sessionStorage)
      return headers
    },
  }),
  endpoints: (builder: any) => ({
    getClientCompanies: builder.query({
      query: () => {
        return {
          url: "/dashboard/client-companies/",
        }
      },
    }),
    useInfo: builder.query({
      query: () => {
        return {
          url: "/dashboard/me",
        }
      },
    }),
    companyData: builder.query({
      query: ({ id }: any) => {
        return {
          url: `/dashboard/client-companies/${id}/events`,
        }
      },
    }),
    companyWeb3Events: builder.query({
      query: ({ id }: any) => {
        return {
          url: `/dashboard/client-companies/${id}/web3-events`,
        }
      },
    }),
    getRegionalData: builder.query({
      query: ({ id, start_date }: any) => {
        return {
          url: `/analytics/regions/${id}?start_date=${start_date}`,
        }
      },
    }),
    getUniqueSessions: builder.query({
      query: ({ id, start_date }: any) => {
        return {
          url: `/dashboard/analytics/unique-users`,
        }
      },
    }),
    //twitter
    realTimeValidateTwitter: builder.query({
      query: (body: any) => ({
        url: "/twitter/users/quick-validate/{handle}",
      }),
    }),
    autocompleteTwitterUser: builder.query({
      query: ({ query }: any) => ({
        url: `/twitter/users/autocomplete?query=${query}&max_results=3`,
      }),
    }),
    twitterMentions: builder.query({
      query: (body: any) => ({
        url: "/twitter/mentions/recent",
      }),
    }),
    twitterMentionsAnalytics: builder.query({
      query: (body: any) => ({
        url: `/twitter/accounts/${body?.twitterId}/mentions/analytics?start_date=2025-08-01&end_date=2025-09-10`,
      }),
    }),
    twitterFollowers: builder.query({
      query: (body: any) => ({
        url: "/twitter/accounts/{twitter_id}/followers",
      }),
    }),
    tweetes: builder.query({
      query: (body: any) => ({
        url: "twitter/accounts/{twitter_id}/followers",
      }),
    }),
    createdtweeters: builder.query({
      query: () => ({
        url: "/dashboard/twitter-status",
      }),
    }),
    connectedWallets: builder.query({
      query: ({ id, isActive }: any) => ({
        url: `/wallets/connections/?company_id=${id}&active_only=${isActive}`,
      }),
    }),
  }),
})

export const {
  useConnectedWalletsQuery,
  useTwitterMentionsAnalyticsQuery,
  useCreatedtweetersQuery,
  useTweetesQuery,
  useTwitterFollowersQuery,
  useTwitterMentionsQuery,
  useAutocompleteTwitterUserQuery,
  useGetUniqueSessionsQuery,
  useRealTimeValidateTwitterQuery,
  useGetRegionalDataQuery,
  useCompanyWeb3EventsQuery,
  useGetClientCompaniesQuery,
  useUseInfoQuery,
  useCompanyDataQuery,
} = queryApi
