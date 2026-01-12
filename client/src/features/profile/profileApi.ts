import { baseApi } from '../../app/store';

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

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение профиля
    getProfile: builder.query<Profile, number>({
      query: (userId) => `/profile/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'Profile', id: userId },
        { type: 'User', id: userId },
      ],
    }),

    // Обновление профиля
    updateProfile: builder.mutation<Profile, Partial<Profile>>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error) => [
        { type: 'Profile', id: result?.id },
        { type: 'User', id: result?.id },
      ],
    }),

    // Загрузка аватара
    uploadAvatar: builder.mutation<Profile, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return {
          url: '/profile/avatar',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error) => [
        { type: 'Profile', id: result?.id },
        { type: 'User', id: result?.id },
      ],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = profileApi;
