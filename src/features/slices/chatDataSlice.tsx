import { createSlice } from '@reduxjs/toolkit';

const initialState = []

const chatDataSlice = createSlice({
  name: 'chatData',
  initialState,
  reducers: {
    setChatData(state, action) {
      return action.payload
    },
    removeChatData(state) {
      return []
    },
  },
});

export const { setChatData, removeChatData } = chatDataSlice.actions;
export default chatDataSlice.reducer;
