// store.js
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import chatUserReducer from './slices/chatUserSlice';
import messageReducer from './slices/messageSlice';
import chatDataReducer from './slices/chatDataSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    chatUser: chatUserReducer,
    messageId: messageReducer,
    chatData: chatDataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // If you want to allow non-serializable values
    }),
});

export default store;
