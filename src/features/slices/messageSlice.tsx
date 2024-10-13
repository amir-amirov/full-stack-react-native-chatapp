import { createSlice } from '@reduxjs/toolkit';

const initialState = null

const messageSlice = createSlice({
  name: 'messageId',
  initialState,
  reducers: {
    setMessageId(state, action) {
      state = action.payload
    },
    removeMessageId(state) {
      state = null
    },
  },
});

export const { setMessageId, removeMessageId } = messageSlice.actions;
export default messageSlice.reducer;
