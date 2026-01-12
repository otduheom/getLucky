import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from './messagesApi';

export interface MessagesState {
  activeChatId: number | null;
  activeChatType: 'private' | 'group' | null;
  // Кэш сообщений по chatId/groupId для оптимистичных обновлений
  messagesCache: Record<string, Message[]>;
}

const initialState: MessagesState = {
  activeChatId: null,
  activeChatType: null,
  messagesCache: {},
};

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveChat: (
      state,
      action: PayloadAction<{ chatId: number; type: 'private' | 'group' } | null>
    ) => {
      if (action.payload) {
        state.activeChatId = action.payload.chatId;
        state.activeChatType = action.payload.type;
      } else {
        state.activeChatId = null;
        state.activeChatType = null;
      }
    },
    addMessageToCache: (
      state,
      action: PayloadAction<{ key: string; message: Message }>
    ) => {
      const { key, message } = action.payload;
      if (!state.messagesCache[key]) {
        state.messagesCache[key] = [];
      }
      // Проверяем, нет ли уже такого сообщения
      if (!state.messagesCache[key].some((msg) => msg.id === message.id)) {
        state.messagesCache[key].push(message);
      }
    },
    updateMessageInCache: (
      state,
      action: PayloadAction<{ key: string; messageId: number; updates: Partial<Message> }>
    ) => {
      const { key, messageId, updates } = action.payload;
      if (state.messagesCache[key]) {
        const index = state.messagesCache[key].findIndex((msg) => msg.id === messageId);
        if (index >= 0) {
          state.messagesCache[key][index] = {
            ...state.messagesCache[key][index],
            ...updates,
          };
        }
      }
    },
    markMessagesAsReadInCache: (
      state,
      action: PayloadAction<{ key: string; senderId: number; receiverId: number }>
    ) => {
      const { key, senderId, receiverId } = action.payload;
      if (state.messagesCache[key]) {
        state.messagesCache[key] = state.messagesCache[key].map((msg) =>
          msg.senderId === senderId && msg.receiverId === receiverId
            ? { ...msg, isRead: true }
            : msg
        );
      }
    },
    clearCache: (state) => {
      state.messagesCache = {};
    },
  },
});

export const {
  setActiveChat,
  addMessageToCache,
  updateMessageInCache,
  markMessagesAsReadInCache,
  clearCache,
} = messagesSlice.actions;

export default messagesSlice.reducer;
