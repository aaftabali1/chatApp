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
  unarchiveChatLoading: boolean;
  unarchiveChatError: string | undefined | null;
  deleteChatLoading: boolean;
  deleteChatError: string | undefined | null;
  clearChatLoading: boolean;
  clearChatError: string | undefined | null;
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
  unarchiveChatLoading: false,
  unarchiveChatError: null,
  deleteChatLoading: false,
  deleteChatError: null,
  clearChatLoading: false,
  clearChatError: null,
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

export const unarchiveChat = createAsyncThunk(
  'chats/unarchiveChat',
  async (datas: any) => {
    const res = await axios.post(constants.ip + '/chats/unarchive-chat', datas);
    const data = await res.data;
    return data;
  },
);

export const deleteChat = createAsyncThunk(
  'chats/deleteChat',
  async (datas: any) => {
    const res = await axios.post(constants.ip + '/chats/delete-chat', datas);
    const data = await res.data;
    return data;
  },
);

export const clearChat = createAsyncThunk(
  'chats/clearChat',
  async (datas: any) => {
    const res = await axios.post(constants.ip + '/chats/clear-chat', datas);
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
    builder.addCase(unarchiveChat.pending, state => {
      state.unarchiveChatLoading = true;
      state.unarchiveChatError = null;
    });
    builder.addCase(unarchiveChat.fulfilled, (state, action) => {
      state.unarchiveChatLoading = false;
      state.chats = action.payload;
    });
    builder.addCase(unarchiveChat.rejected, (state, action) => {
      state.unarchiveChatLoading = false;
      state.unarchiveChatError = action.error.message;
    });
    builder.addCase(deleteChat.pending, state => {
      state.deleteChatLoading = true;
      state.deleteChatError = null;
    });
    builder.addCase(deleteChat.fulfilled, (state, action) => {
      state.deleteChatLoading = false;
      state.chats = action.payload;
    });
    builder.addCase(deleteChat.rejected, (state, action) => {
      state.deleteChatLoading = false;
      state.deleteChatError = action.error.message;
    });
    builder.addCase(clearChat.pending, state => {
      state.clearChatLoading = true;
      state.clearChatError = null;
    });
    builder.addCase(clearChat.fulfilled, (state, action) => {
      state.clearChatLoading = false;
      state.chats = action.payload;
    });
    builder.addCase(clearChat.rejected, (state, action) => {
      state.clearChatLoading = false;
      state.clearChatError = action.error.message;
    });
  },
});

export default chatsSlice.reducer;
