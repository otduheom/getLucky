import axiosInstance from '../../shared/lib/axiosInstance';

export interface Friend {
  id: number;
  name: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lastSeen?: string;
}

export default class FriendsApi {
  static async getFriends(): Promise<Friend[]> {
    const response = await axiosInstance.get('/friends');
    return response.data;
  }

  static async getPopularUsers(): Promise<Friend[]> {
    const response = await axiosInstance.get('/friends/popular');
    return response.data;
  }

  static async searchFriends(query: string): Promise<Friend[]> {
    const response = await axiosInstance.get(`/friends/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  static async getOnlineFriends(): Promise<Friend[]> {
    const response = await axiosInstance.get('/friends/online');
    return response.data;
  }

  static async sendFriendRequest(userId: number): Promise<void> {
    await axiosInstance.post(`/friends/request/${userId}`);
  }

  static async acceptFriendRequest(requestId: number): Promise<void> {
    await axiosInstance.put(`/friends/accept/${requestId}`);
  }

  static async removeFriend(friendId: number): Promise<void> {
    await axiosInstance.delete(`/friends/${friendId}`);
  }
}