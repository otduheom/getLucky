import axiosInstance from '../../shared/lib/axiosInstance';

export interface SearchUser {
  id: number;
  name: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export default class SearchApi {
  static async searchUsers(query: string): Promise<SearchUser[]> {
    const response = await axiosInstance.get(`/search/users?query=${encodeURIComponent(query)}`);
    return response.data;
  }
}