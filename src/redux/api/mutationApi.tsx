import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
//api.theoxygen.com test submit
const baseUrl = "http://127.0.0.1:8000/"

export const mutationApi = createApi({
  reducerPath: "api",
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
  }),
})

export const {
  useCreatePlatformUsersMutation,
  usePlatformUserLoginMutation,
  useCreateClientCompanyMutation,
} = mutationApi
