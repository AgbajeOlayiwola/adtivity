import { createSlice } from "@reduxjs/toolkit"
const initialState = null
const documentsSlice = createSlice({
  name: "twitterItems",
  initialState,
  reducers: {
    setTwitterItems: (_state, { payload }) => {
      return payload
    },
    clearTwitterItems: () => {
      return null
    },
  },
})

const { reducer, actions } = documentsSlice
export const { setTwitterItems, clearTwitterItems } = actions
export default reducer
