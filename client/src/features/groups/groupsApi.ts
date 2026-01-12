import { baseApi } from '../../app/store';
import { Friend } from '../friends/friendsApi';

export interface Group {
  id: number;
  name: string;
  description?: string;
  creatorId: number;
  avatar?: string;
  members?: Friend[];
  createdAt: string;
}

export interface GroupMember {
  id: number;
  userId: number;
  groupId: number;
  role: 'member' | 'admin';
  joinedAt: string;
  user?: Friend;
}

export interface GroupChat {
  group: Group;
  lastMessage: any;
  unreadCount: number;
}

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Создание группы
    createGroup: builder.mutation<
      Group,
      { name: string; description?: string; memberIds: number[] }
    >({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group', 'Chat'],
    }),

    // Получение списка групп
    getGroups: builder.query<GroupChat[], void>({
      query: () => '/groups',
      providesTags: ['Group'],
    }),

    // Получение одной группы
    getGroup: builder.query<Group, number>({
      query: (groupId) => `/groups/${groupId}`,
      providesTags: (result, error, groupId) => [
        { type: 'Group', id: groupId },
      ],
    }),

    // Добавление участников в группу
    addMembers: builder.mutation<GroupMember[], { groupId: number; memberIds: number[] }>({
      query: ({ groupId, memberIds }) => ({
        url: `/groups/${groupId}/members`,
        method: 'POST',
        body: { memberIds },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.groupId },
      ],
    }),

    // Удаление участника из группы
    removeMember: builder.mutation<void, { groupId: number; userId: number }>({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Group', id: arg.groupId },
      ],
    }),

    // Выход из группы
    leaveGroup: builder.mutation<void, number>({
      query: (groupId) => ({
        url: `/groups/${groupId}/leave`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, groupId) => [
        { type: 'Group', id: groupId },
        'Chat',
      ],
    }),

    // Получение участников группы
    getGroupMembers: builder.query<GroupMember[], number>({
      query: (groupId) => `/groups/${groupId}/members`,
      providesTags: (result, error, groupId) => [
        { type: 'Group', id: groupId },
      ],
    }),
  }),
});

export const {
  useCreateGroupMutation,
  useGetGroupsQuery,
  useGetGroupQuery,
  useAddMembersMutation,
  useRemoveMemberMutation,
  useLeaveGroupMutation,
  useGetGroupMembersQuery,
} = groupsApi;
