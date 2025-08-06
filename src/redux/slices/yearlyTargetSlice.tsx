import {createSlice} from '@reduxjs/toolkit';
const initialState = {};
const yearlyTargetSlice = createSlice({
  name: 'yearlyTarget',
  initialState,
  reducers: {
    setYearlyTarget: (_state, {payload}) => {
      return payload;
    },
    clearYearlyTarget: () => {
      return {};
    },
  },
});

const {reducer, actions} = yearlyTargetSlice;
export const {setYearlyTarget, clearYearlyTarget} = actions;
export default reducer;
