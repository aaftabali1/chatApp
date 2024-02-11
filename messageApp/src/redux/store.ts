// store.ts
import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatsReducer from './slices/chatsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
