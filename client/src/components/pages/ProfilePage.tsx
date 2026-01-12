import { useState } from 'react';
import { useParams } from 'react-router';
import { useAppSelector } from '../../app/hooks';
import { useGetProfileQuery, Profile } from '../../features/profile/profileApi';
import ProfileHeader from './ProfilePage/ProfileHeader';
import ProfileEditForm from './ProfilePage/ProfileEditForm';
import FriendsList from './ProfilePage/FriendsList';
import AddFriendButton from '../ui/AddFriendButton';
import FriendshipActions from './ProfilePage/FriendshipActions';

export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const profileUserId = userId ? parseInt(userId, 10) : currentUserId;
  const isOwnProfile = profileUserId === currentUserId;
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: profile,
    isLoading: loading,
    error,
  } = useGetProfileQuery(profileUserId!, { skip: !profileUserId });

  const handleProfileUpdate = () => {
    // RTK Query автоматически обновит данные через инвалидацию тегов
  };

  if (loading) {
    return <div>Загрузка профиля...</div>;
  }

  if (error || (!profile && !loading)) {
    return (
      <div style={{ color: 'red' }}>
        {error
          ? 'data' in error
            ? (error.data as any)?.message || 'Ошибка загрузки профиля'
            : 'Ошибка загрузки профиля'
          : 'Профиль не найден'}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onProfileUpdate={handleProfileUpdate}
      />

      {isOwnProfile && (
        <div style={{ marginBottom: '24px' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Редактировать профиль
            </button>
          ) : (
            <ProfileEditForm
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </div>
      )}

      {!isOwnProfile && currentUserId && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AddFriendButton userId={profile.id} />
          <FriendshipActions userId={profile.id} currentUserId={currentUserId} />
        </div>
      )}

      <FriendsList 
        userId={profile.id} 
        isOwnProfile={isOwnProfile} 
        currentUserId={currentUserId}
      />
    </div>
  );
}