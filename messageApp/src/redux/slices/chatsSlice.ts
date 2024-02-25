import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import constants from '../../utils/constants';

interface ChatsState {
  chats: [];
  chatsLoading: boolean;
  chatsError: string | undefined | null;
  pinLoading: boolean;
  pinError: string | undefined | null;
  unPinLoading: boolean;
  unPinError: string | undefined | null;
  archiveChatLoading: boolean;
  archiveChatError: string | undefined | null;
}

const initialState: ChatsState = {
  chats: [],
  chatsLoading: false,
  chatsError: null,
  pinLoading: false,
  pinError: null,
  unPinLoading: false,
  unPinError: null,
  archiveChatLoading: false,
  archiveChatError: null,
};

export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (datas: any) => {
    const res = await axios.post(constants.ip + '/chats', datas);
    const data = await res.data;
    return data;
  },
);

export const pinChat = createAsyncThunk('chats/pinChat', async (datas: any) => {
  const res = await axios.post(constants.ip + '/chats/pin-chat', datas);
  const data = await res.data;
  return data;
});

export const unPinChat = createAsyncThunk(
  'chats/unPinChat',
  async (datas: any) => {
    const res = await axios.post(constants.ip + '/chats/unpin-chat', datas);
    const data = await res.data;
    return data;
  },
);

export const archiveChat = createAsyncThunk(
  'chats/archiveChat',
  async (datas: any) => {
    const res = await axios.post(constants.ip + '/chats/archive-chat', datas);
    const data = await res.data;
    return data;
  },
);

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchChats.pending, state => {
      state.chatsLoading = true;
      state.chatsError = null;
    });
    builder.addCase(fetchChats.fulfilled, (state, action) => {
      state.chatsLoading = false;
      state.chats = action.payload;
    });
    builder.addCase(fetchChats.rejected, (state, action) => {
      state.chatsLoading = false;
      state.chatsError = action.error.message;
    });
    builder.addCase(pinChat.pending, state => {
      state.pinLoading = true;
      state.pinError = null;
    });
    builder.addCase(pinChat.fulfilled, (state, action) => {
      state.pinLoading = false;
      state.chats = action.payload;
    });
    builder.addCase(pinChat.rejected, (state, action) => {
      state.pinLoading = false;
      state.pinError = action.error.message;
    });
    builder.addCase(unPinChat.pending, state => {
      state.unPinLoading = true;
      state.unPinError = null;
    });
    builder.addCase(unPinChat.fulfilled, (state, action) => {
      state.unPinLoading = false;
      state.chats = action.payload;
    });
    builder.addCase(unPinChat.rejected, (state, action) => {
      state.unPinLoading = false;
      state.unPinError = action.error.message;
    });
    builder.addCase(archiveChat.pending, state => {
      state.archiveChatLoading = true;
      state.archiveChatError = null;
    });
    builder.addCase(archiveChat.fulfilled, (state, action) => {
      state.archiveChatLoading = false;
      state.chats = action.payload;
    });
    builder.addCase(archiveChat.rejected, (state, action) => {
      state.archiveChatLoading = false;
      state.archiveChatError = action.error.message;
    });
  },
});

export default chatsSlice.reducer;
