import { createSlice } from "@reduxjs/toolkit"
const initialState = {}
const profileSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setProfile: (_state, { payload }) => {
      return payload
    },
    clearProfile: () => {
      return {}
    },
  },
})

const { reducer, actions } = profileSlice
export const { setProfile, clearProfile } = actions
export default reducer
