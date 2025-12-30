import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
let accessToken = "";

export function setAccessToken(newToken: string): void {
  accessToken = newToken;
}

export function getAccessToken(): string {
  return accessToken;
}

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error.config as InternalAxiosRequestConfig & { sent?: boolean };
    if (error.response?.status === 403 && !prevRequest.sent) {
      const response = await axiosInstance("/auth/refreshTokens");
      accessToken = response.data.accessToken;
      prevRequest.sent = true;
      prevRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(prevRequest);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

