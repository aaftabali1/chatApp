// slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  username: string | null;
}

const initialState: AuthState = {
  username: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string | null>) => {
      state.username = action.payload;
    },
  },
});

export const {setUsername} = authSlice.actions;
export const selectUsername = (state: {auth: AuthState}) => state.auth.username;
export default authSlice.reducer;
