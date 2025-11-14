import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
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

export const mutationApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    createPlatformUsers: builder.mutation({
      query: (body: any) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    platformUserLogin: builder.mutation({
      query: (body: any) => ({
        url: "/auth/token",
        method: "POST",
        body,
      }),
    }),
    createClientCompany: builder.mutation({
      query: (body: any) => ({
        url: "/dashboard/client-companies",
        method: "POST",
        body,
      }),
    }),
    clientCompaniesTokenEvents: builder.mutation({
      query: (body: any) => ({
        url: "/dashboard/client-companies",
        method: "POST",
        body,
      }),
    }),
    validateTwitter: builder.mutation({
      query: (body: any) => ({
        url: "/twitter/users/validate",
        method: "POST",
        body,
      }),
    }),
    twitterUsersSearch: builder.mutation({
      query: (body: any) => ({
        url: "/twitter/users/search",
        method: "POST",
        body,
      }),
    }),
    createTwitterAccounts: builder.mutation({
      query: (body: any) => ({
        url: "/twitter/accounts/",
        method: "POST",
        body,
      }),
    }),
    deleteTwitterAccount: builder.mutation({
      query: ({ twitterId }: { twitterId: string }) => ({
        url: `/twitter/accounts/${twitterId}`,
        method: "DELETE",
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body: { email: string }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body: { token: string; new_password: string }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation({
      query: (body: { current_password: string; new_password: string }) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    analyzeKOL: builder.mutation({
      query: (body: { username: string; max_tweets?: number; max_mentions?: number }) => ({
        url: "/twitter/kol/analyze",
        method: "POST",
        body,
      }),
    }),
    getKOLRecommendation: builder.mutation({
      // Use queryFn to bypass baseQuery and call Next.js API directly
      queryFn: async (arg: {
        kol_data: any;
        brand_goals: string[];
        additional_context?: string;
      }) => {
        try {
          const result = await fetch("/api/kol-recommendation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(arg),
          })

          if (!result.ok) {
            const error = await result.json()
            return { error }
          }

          const data = await result.json()
          return { data }
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: { error: error?.message || "Failed to get recommendation" },
            },
          }
        }
      },
    }),
    deleteClientCompany: builder.mutation({
      query: ({ companyId }: { companyId: string }) => ({
        url: `/dashboard/client-companies/${companyId}`,
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useCreateTwitterAccountsMutation,
  useDeleteTwitterAccountMutation,
  useTwitterUsersSearchMutation,
  useCreatePlatformUsersMutation,
  usePlatformUserLoginMutation,
  useCreateClientCompanyMutation,
  useValidateTwitterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useAnalyzeKOLMutation,
  useGetKOLRecommendationMutation,
  useDeleteClientCompanyMutation,
} = mutationApi
