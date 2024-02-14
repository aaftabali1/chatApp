// slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  username: string | null;
  userId: string | null;
}

const initialState: AuthState = {
  username: null,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string | null>) => {
      state.username = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
  },
});

export const {setUsername, setUserId} = authSlice.actions;
export const selectUsername = (state: {auth: AuthState}) => state.auth.username;
export const selectUserId = (state: {auth: AuthState}) => state.auth.userId;
export default authSlice.reducer;
