import { createSlice } from "@reduxjs/toolkit"
const initialState = null
const merchantCountSlice = createSlice({
  name: "merchantCount",
  initialState,
  reducers: {
    setMerchantCount: (_state, { payload }) => {
      return payload
    },
    clearMerchantCount: () => {
      return null
    },
  },
})

const { reducer, actions } = merchantCountSlice
export const { setMerchantCount, clearMerchantCount } = actions
export default reducer
