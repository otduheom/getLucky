import { baseApi } from '../../app/store';
import { Group } from '../groups/groupsApi';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number | null; // null для групповых сообщений
  groupId: number | null; // null для личных сообщений
  text: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
  receiver?: {
    id: number;
    name: string;
    avatar?: string;
  };
  group?: Group; // Для групповых сообщений
}

export interface Chat {
  type: 'private' | 'group';
  friend?: {
    id: number;
    name: string;
    avatar?: string;
  };
  group?: Group; // Для групповых чатов
  lastMessage: Message | null;
  unreadCount: number;
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение сообщений чата
    getMessages: builder.query<Message[], number>({
      query: (friendId) => `/messages/chat/${friendId}`,
      providesTags: (result, error, friendId) => [
        { type: 'Message', id: `chat-${friendId}` },
      ],
    }),

    // Отправка сообщения
    sendMessage: builder.mutation<Message, { receiverId: number; text: string }>({
      query: (body) => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Message', id: `chat-${arg.receiverId}` },
        { type: 'Chat' },
      ],
    }),

    // Получение списка чатов
    getChats: builder.query<Chat[], void>({
      query: () => '/messages/chats',
      providesTags: ['Chat'],
    }),

    // Получение количества непрочитанных сообщений
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/messages/unread-count',
      providesTags: ['Message'],
    }),

    // Отметить сообщение как прочитанное
    markAsRead: builder.mutation<void, number>({
      query: (messageId) => ({
        url: `/messages/${messageId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message', 'Chat'],
    }),

    // Отметить все сообщения в чате как прочитанные
    markAllAsRead: builder.mutation<void, number>({
      query: (friendId) => ({
        url: `/messages/chat/${friendId}/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, friendId) => [
        { type: 'Message', id: `chat-${friendId}` },
        { type: 'Chat' },
      ],
    }),

    // Групповые сообщения
    sendGroupMessage: builder.mutation<Message, { groupId: number; text: string }>({
      query: (body) => ({
        url: '/messages/group',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Message', id: `group-${arg.groupId}` },
        { type: 'Chat' },
      ],
    }),

    // Получение сообщений группы
    getGroupMessages: builder.query<Message[], number>({
      query: (groupId) => `/messages/group/${groupId}`,
      providesTags: (result, error, groupId) => [
        { type: 'Message', id: `group-${groupId}` },
      ],
    }),

    // Отметить групповые сообщения как прочитанные
    markGroupMessagesAsRead: builder.mutation<void, number>({
      query: (groupId) => ({
        url: `/messages/group/${groupId}/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, groupId) => [
        { type: 'Message', id: `group-${groupId}` },
        { type: 'Chat' },
      ],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetChatsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useSendGroupMessageMutation,
  useGetGroupMessagesQuery,
  useMarkGroupMessagesAsReadMutation,
} = messagesApi;
