import { createSlice } from "@reduxjs/toolkit"
const initialState = {}
const analyticsDataSlice = createSlice({
  name: "analyticsData",
  initialState,
  reducers: {
    setAnalyticsData: (_state, { payload }) => {
      return payload
    },
    clearAnalyticsData: () => {
      return {}
    },
  },
})

const { reducer, actions } = analyticsDataSlice
export const { setAnalyticsData, clearAnalyticsData } = actions
export default reducer
