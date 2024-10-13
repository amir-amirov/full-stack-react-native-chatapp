import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastMessage: null,
  messageId: null,
  messageSeen: null,
  rId: null,
  updatedAt: null,
  chatData: [],
};

const chatUserSlice = createSlice({
  name: 'chatUser',
  initialState,
  reducers: {
    setChatUser(state, action) {
      return action.payload
    },
    removeChatUser(state) {
      return initialState
    },
  },
});

export const { setChatUser, removeChatUser } = chatUserSlice.actions;
export default chatUserSlice.reducer;
