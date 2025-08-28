import { createSlice } from "@reduxjs/toolkit"
const initialState = null
const documentsSlice = createSlice({
  name: "apikey",
  initialState,
  reducers: {
    setApikey: (_state, { payload }) => {
      return payload
    },
    clearApikey: () => {
      return null
    },
  },
})

const { reducer, actions } = documentsSlice
export const { setApikey, clearApikey } = actions
export default reducer
