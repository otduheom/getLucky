import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProfileApi, { Profile } from '../../entities/profile/ProfileApi';
import ProfileHeader from './ProfilePage/ProfileHeader';
import ProfileEditForm from './ProfilePage/ProfileEditForm';
import FriendsList from './ProfilePage/FriendsList';
import AddFriendButton from '../ui/AddFriendButton';
import FriendshipActions from './ProfilePage/FriendshipActions';

interface ProfilePageProps {
  currentUserId?: number; // ID текущего пользователя
}

export default function ProfilePage({ currentUserId }: ProfilePageProps) {
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileUserId = userId ? parseInt(userId, 10) : currentUserId;
  const isOwnProfile = profileUserId === currentUserId;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileUserId) {
        setError('Пользователь не найден');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profileData = await ProfileApi.getProfile(profileUserId);
        setProfile(profileData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileUserId]);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return <div>Загрузка профиля...</div>;
  }

  if (error || !profile) {
    return <div style={{ color: 'red' }}>{error || 'Профиль не найден'}</div>;
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