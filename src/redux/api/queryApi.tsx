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
  }),
})

export const {
  useCompanyWeb3EventsQuery,
  useGetClientCompaniesQuery,
  useUseInfoQuery,
  useCompanyDataQuery,
} = queryApi
