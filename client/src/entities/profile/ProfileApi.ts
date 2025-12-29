import axiosInstance from '../../shared/lib/axiosInstance';

export interface Profile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  city?: string;
  about?: string;
  lastSeen?: string;
}

export default class ProfileApi {
  static async getProfile(userId: number): Promise<Profile> {
    const response = await axiosInstance.get(`/profile/${userId}`);
    return response.data;
  }

  static async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = await axiosInstance.put('/profile', data);
    return response.data;
  }

  static async uploadAvatar(file: File): Promise<Profile> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axiosInstance.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}