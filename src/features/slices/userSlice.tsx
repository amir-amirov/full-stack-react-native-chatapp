import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: null,
  id: null,
  username: null,
  name: null,
  avatar: null,
  bio: null,
  lastSeen: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.email = action.payload.email
      state.id = action.payload.id
      state.username = action.payload.username
      state.name = action.payload.name
      state.avatar = action.payload.avatar
      state.bio = action.payload.bio
      state.lastSeen = action.payload.lastSeen
    },
    removeUser(state) {
      state.email = null
      state.id = null
      state.username = null
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
