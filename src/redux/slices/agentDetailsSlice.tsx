import {createSlice} from '@reduxjs/toolkit';
const initialState = {};
const agentDetailsSlice = createSlice({
  name: 'agentDetails',
  initialState,
  reducers: {
    setAgentDetails: (_state, {payload}) => {
      return payload;
    },
    clearAgentDetails: () => {
      return {};
    },
  },
});

const {reducer, actions} = agentDetailsSlice;
export const {setAgentDetails, clearAgentDetails} = actions;
export default reducer;
