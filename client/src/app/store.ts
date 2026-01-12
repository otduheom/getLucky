import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axiosInstance, { getAccessToken, setAccessToken } from '../shared/lib/axiosInstance';
import { configureStore } from '@reduxjs/toolkit';
import socketMiddleware from '../shared/lib/socketMiddleware';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice';
import messagesReducer from '../features/messages/messagesSlice';
import friendsReducer from '../features/friends/friendsSlice';
import groupsReducer from '../features/groups/groupsSlice';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Chat', 'Message', 'Friend', 'Group', 'Profile'],
  endpoints: () => ({}),
});

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    messages: messagesReducer,
    friends: friendsReducer,
    groups: groupsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/connect', 'socket/disconnecct'],
      },
    })
      .concat(baseApi.middleware)
      .concat(socketMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
