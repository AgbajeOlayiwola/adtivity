import { createSlice } from "@reduxjs/toolkit"
const initialState = null
const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (_state, { payload }) => {
      return payload
    },
    clearDocuments: () => {
      return null
    },
  },
})

const { reducer, actions } = documentsSlice
export const { setDocuments, clearDocuments } = actions
export default reducer
