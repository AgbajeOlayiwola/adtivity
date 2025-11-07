import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { deleteCookie } from "cookies-next"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

// Custom base query with 401 error handling
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: any, { getState }: any) => {
      const token = getState().token
      headers.set("Accept", "application/json")
      headers.set("Content-Type", "application/json")
      headers.set("User-Role", "Adtivity App")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  })

  const result = await baseQuery(args, api, extraOptions)

  // Handle 401 Unauthorized responses
  if (result.error && result.error.status === 401) {
    // Clear token from redux store
    api.dispatch({ type: "token/clearToken" })

    // Clear auth cookie
    deleteCookie("auth-token")

    // Clear localStorage/sessionStorage if needed
    if (typeof window !== "undefined") {
      localStorage.clear()
      sessionStorage.clear()
    }

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  return result
}

export const queryApi = createApi({
  reducerPath: "queryApi",
  baseQuery: baseQueryWithAuth,
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
          url: `/dashboard/all-events?company_id=${id}`,
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
      query: (body: any) => {
        const companyIdParam = body?.companyId
          ? `&company_id=${body.companyId}`
          : ""
        const startDate = body?.startDate || "2025-08-01"
        const endDate = body?.endDate || "2025-09-10"
        return {
          url: `/twitter/accounts/${body?.twitterId}/mentions/analytics?start_date=${startDate}&end_date=${endDate}`,
        }
      },
    }),
    twitterFollowers: builder.query({
      query: ({ twitterId }: any) => ({
        url: `/twitter/accounts/${twitterId}/followers`,
      }),
    }),
    tweets: builder.query({
      query: ({ twitterId }: any) => ({
        url: `/twitter/accounts/${twitterId}/tweets`,
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
    walletBalance: builder.query({
      query: ({ walletAddress, network }: any) => ({
        url: `/dashboard/analytics/web3/wallet/${walletAddress}/balance?network=${network}`,
      }),
    }),
    userEngagementTimeSeries: builder.query({
      query: ({ companyId, startDate, endDate, intervalHours }: any) => {
        let url = `/user-engagement/analytics/${companyId}/time-series/?start_date=${startDate}`
        if (endDate) {
          url += `&end_date=${endDate}`
        }
        if (intervalHours) {
          url += `&interval_hours=${intervalHours}`
        }
        return { url }
      },
    }),
    newUsersAnalytics: builder.query({
      query: ({ companyId, startDate, endDate }: any) => {
        let url = `/user-engagement/analytics/${companyId}/new-users/?start_date=${startDate}`
        if (endDate) {
          url += `&end_date=${endDate}`
        }
        return { url }
      },
    }),
  }),
})

export const {
  useNewUsersAnalyticsQuery,
  useUserEngagementTimeSeriesQuery,
  useWalletBalanceQuery,
  useConnectedWalletsQuery,
  useTwitterMentionsAnalyticsQuery,
  useCreatedtweetersQuery,
  useTweetsQuery,
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
