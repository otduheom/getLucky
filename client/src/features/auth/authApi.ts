import { baseApi } from '../../app/store';
import { setAccessToken } from '../../shared/lib/axiosInstance';
import { authSlice } from './authSlice';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshTokensResponse {
  user: User;
  accessToken: string;
}

// Расширяем baseApi endpoints для авторизации
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Query для проверки токена при загрузке приложения
    refreshTokens: builder.query<RefreshTokensResponse, void>({
      query: () => '/auth/refreshTokens',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Сохраняем токен в axiosInstance
          setAccessToken(data.accessToken);
          // Обновляем состояние авторизации в слайсе
          dispatch(authSlice.actions.setUser({ status: 'logged', user: data.user }));
        } catch (error: any) {
          // Если 401 - это нормально для неавторизованного пользователя
          if (error.status !== 401) {
            console.error('Ошибка при проверке авторизации:', error);
          }
          // Устанавливаем статус гостя
          setAccessToken('');
          dispatch(authSlice.actions.setUser({ status: 'guest', user: null }));
        }
      },
    }),

    // Mutation для входа
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Сохраняем токен
          setAccessToken(data.accessToken);
          // Обновляем состояние
          dispatch(authSlice.actions.setUser({ status: 'logged', user: data.user }));
        } catch (error) {
          // Ошибка обрабатывается автоматически RTK Query
        }
      },
    }),

    // Mutation для регистрации
    signup: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setAccessToken(data.accessToken);
          dispatch(authSlice.actions.setUser({ status: 'logged', user: data.user }));
        } catch (error) {
          // Ошибка обрабатывается автоматически
        }
      },
    }),

    // Mutation для выхода
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Chat', 'Message', 'Friend', 'Group', 'Profile'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Очищаем токен и состояние
          setAccessToken('');
          dispatch(authSlice.actions.setUser({ status: 'guest', user: null }));
        } catch (error) {
          // Даже при ошибке очищаем состояние на клиенте
          setAccessToken('');
          dispatch(authSlice.actions.setUser({ status: 'guest', user: null }));
        }
      },
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const { useRefreshTokensQuery, useLoginMutation, useSignupMutation, useLogoutMutation } =
  authApi;
