import { baseApi } from '../../app/store';

export interface Friend {
  id: number;
  name: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lastSeen?: string;
}

export interface FriendRequest {
  id: number;
  user: Friend;
  createdAt: string;
}

export interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'blocked';
  friendshipId?: number;
  isRequester?: boolean;
}

export const friendsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка друзей
    getFriends: builder.query<Friend[], void>({
      query: () => '/friends',
      providesTags: ['Friend'],
    }),

    // Получение популярных пользователей
    getPopularUsers: builder.query<Friend[], void>({
      query: () => '/friends/popular',
      providesTags: ['Friend'],
    }),

    // Поиск друзей
    searchFriends: builder.query<Friend[], string>({
      query: (query) => `/friends/search?query=${encodeURIComponent(query)}`,
      providesTags: ['Friend'],
    }),

    // Получение онлайн друзей
    getOnlineFriends: builder.query<Friend[], void>({
      query: () => '/friends/online',
      providesTags: ['Friend'],
    }),

    // Отправка заявки в друзья
    sendFriendRequest: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/friends/request/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Friend'],
    }),

    // Принятие заявки в друзья
    acceptFriendRequest: builder.mutation<void, number>({
      query: (requestId) => ({
        url: `/friends/accept/${requestId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Friend'],
    }),

    // Удаление друга
    removeFriend: builder.mutation<void, number>({
      query: (friendId) => ({
        url: `/friends/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friend'],
    }),

    // Получение заявок в друзья
    getFriendRequests: builder.query<FriendRequest[], void>({
      query: () => '/friends/requests',
      providesTags: ['Friend'],
    }),

    // Получение статуса дружбы
    getFriendshipStatus: builder.query<FriendshipStatus, number>({
      query: (friendId) => `/friends/status/${friendId}`,
      providesTags: (result, error, friendId) => [
        { type: 'Friend', id: friendId },
      ],
    }),
  }),
});

export const {
  useGetFriendsQuery,
  useGetPopularUsersQuery,
  useSearchFriendsQuery,
  useGetOnlineFriendsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRemoveFriendMutation,
  useGetFriendRequestsQuery,
  useGetFriendshipStatusQuery,
} = friendsApi;
