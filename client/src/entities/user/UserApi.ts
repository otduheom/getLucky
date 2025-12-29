import axiosInstance from '../../shared/lib/axiosInstance';

interface UserData {
  name?: string;
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    user: {
      name: string;
      email: string;
    };
    accessToken: string;
  };
}

interface SignUpResponse {
  data: {
    user: {
      name: string;
      email: string;
    };
    accessToken: string;
  };
}

export default class UserApi {
  static async signup(userData: UserData): Promise<SignUpResponse> {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response;
  }

  static async login(userData: Omit<UserData, 'name'>): Promise<LoginResponse> {
    const response = await axiosInstance.post('/auth/login', userData);
    return response;
  }

  static async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  }
}

