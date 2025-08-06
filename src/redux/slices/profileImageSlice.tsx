import { createSlice } from "@reduxjs/toolkit"
const initialState = {}
const profileImageSlice = createSlice({
  name: "profileImage",
  initialState,
  reducers: {
    setProfileImage: (_state, { payload }) => {
      return payload
    },
    clearProfileImage: () => {
      return {}
    },
  },
})

const { reducer, actions } = profileImageSlice
export const { setProfileImage, clearProfileImage } = actions
export default reducer
