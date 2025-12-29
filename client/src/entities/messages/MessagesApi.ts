import axiosInstance from '../../shared/lib/axiosInstance';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
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
}

export interface Chat {
  friend: {
    id: number;
    name: string;
    avatar?: string;
  };
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
}