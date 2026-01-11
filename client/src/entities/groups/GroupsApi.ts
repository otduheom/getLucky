import axiosInstance from '../../shared/lib/axiosInstance';
import { Friend } from '../friends/FriendsApi';

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

export default class GroupsApi {
  static async createGroup(
    name: string,
    description: string | undefined,
    memberIds: number[],
  ): Promise<Group> {
    const response = await axiosInstance.post('/groups', {
      name,
      description,
      memberIds,
    });
    return response.data;
  }

  static async getGroups(): Promise<
    Array<{ group: Group; lastMessage: any; unreadCount: number }>
  > {
    const response = await axiosInstance.get('/groups');
    return response.data;
  }

  static async getGroup(groupId: number): Promise<Group> {
    const response = await axiosInstance.get(`/groups/${groupId}`);
    return response.data;
  }

  static async addMembers(groupId: number, memberIds: number[]): Promise<GroupMember[]> {
    const response = await axiosInstance.post(`/groups/${groupId}/members`, {
      memberIds,
    });
    return response.data;
  }

  static async removeMember(groupId: number, userId: number): Promise<void> {
    await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
  }

  static async leaveGroup(groupId: number): Promise<void> {
    await axiosInstance.delete(`/groups/${groupId}/leave`);
  }

  static async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const response = await axiosInstance.get(`/groups/${groupId}/members`);
    return response.data;
  }
}
