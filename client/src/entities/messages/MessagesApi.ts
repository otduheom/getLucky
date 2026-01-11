import axiosInstance from '../../shared/lib/axiosInstance';
import { Group } from '../groups/GroupsApi';

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

export default class MessagesApi {
  static async getMessages(friendId: number): Promise<Message[]> {
    const response = await axiosInstance.get(`/messages/chat/${friendId}`);
    return response.data;
  }

  static async sendMessage(receiverId: number, text: string): Promise<Message> {
    const response = await axiosInstance.post('/messages', {
      receiverId,
      text,
    });
    return response.data;
  }

  static async getChats(): Promise<Chat[]> {
    const response = await axiosInstance.get('/messages/chats');
    return response.data;
  }

  static async getUnreadCount(): Promise<number> {
    const response = await axiosInstance.get('/messages/unread-count');
    return response.data.unreadCount;
  }

  static async markAsRead(messageId: number): Promise<void> {
    await axiosInstance.put(`/messages/${messageId}/read`);
  }

  static async markAllAsRead(friendId: number): Promise<void> {
    await axiosInstance.put(`/messages/chat/${friendId}/read-all`);
  }

  // Групповые сообщения
  static async sendGroupMessage(groupId: number, text: string): Promise<Message> {
    const response = await axiosInstance.post('/messages/group', {
      groupId,
      text,
    });
    return response.data;
  }

  static async getGroupMessages(groupId: number): Promise<Message[]> {
    const response = await axiosInstance.get(`/messages/group/${groupId}`);
    return response.data;
  }

  static async markGroupMessagesAsRead(groupId: number): Promise<void> {
    await axiosInstance.put(`/messages/group/${groupId}/read-all`);
  }
}