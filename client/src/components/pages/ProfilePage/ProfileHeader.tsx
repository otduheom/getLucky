import { useState, useRef } from 'react';
import UserAvatar from '../../ui/UserAvatar';
import ProfileApi, { Profile } from '../../../entities/profile/ProfileApi';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';
import { showToast } from '../../../shared/lib/toast';

interface ProfileHeaderProps {
    profile: Profile;
    isOwnProfile: boolean;
    onProfileUpdate: (profile: Profile) => void;
}

export default function ProfileHeader({ profile, isOwnProfile, onProfileUpdate }: ProfileHeaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        if(isOwnProfile && fileInputRef.current) {
        fileInputRef.current.click();
    }
};

const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;

    setIsUploading(true);
    try{
        const updatedProfile = await ProfileApi.uploadAvatar(file);
        onProfileUpdate(updatedProfile);
        showToast.success('Аватар успешно обновлен');
    } catch(err: any) {
        showToast.error(err.response?.data?.message || 'Ошибка при обновлении аватара');
    } finally {
        setIsUploading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
    }

    const displayName = profile.nickname || (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.name);

    return (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={handleAvatarClick}
              style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            >
              <UserAvatar 
                src={getAvatarUrl(profile.avatar)}
                name={profile.name} 
                size="lg" 
              />
            </div>
            {isUploading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                Загрузка...
              </div>
            )}
            {isOwnProfile && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            )}
          </div>
          <div>
            <h1>{displayName}</h1>
            {profile.city && <p>Город: {profile.city}</p>}
            {profile.age && <p>Возраст: {profile.age}</p>}
            {profile.about && <p>{profile.about}</p>}
          </div>
        </div>
      );
}

    
