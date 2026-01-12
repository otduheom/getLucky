import { useState, FormEvent } from 'react';
import { useUpdateProfileMutation, Profile } from '../../../features/profile/profileApi';
import { showToast } from '../../../shared/lib/toast';

interface ProfileEditFormProps {
  profile: Profile;
  onProfileUpdate: () => void;
  onCancel: () => void;
}

export default function ProfileEditForm({ profile, onProfileUpdate, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    nickname: profile.nickname || '',
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    age: profile.age?.toString() || '',
    city: profile.city || '',
    about: profile.about || '',
  });
  const [updateProfile, { isLoading: loading }] = useUpdateProfileMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const updateData: Partial<Profile> = {
        name: formData.name,
        nickname: formData.nickname || undefined,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        city: formData.city || undefined,
        about: formData.about || undefined,
      };

      await updateProfile(updateData).unwrap();
      showToast.success('Профиль успешно обновлен');
      onProfileUpdate();
      onCancel();
    } catch (error: any) {
      showToast.error(error.data?.message || error.message || 'Ошибка обновления профиля');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Имя:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Никнейм:</label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Имя:</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Фамилия:</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Возраст:</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          min="1"
          max="150"
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Город:</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>О себе:</label>
        <textarea
          value={formData.about}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          rows={4}
          style={{ width: '100%', padding: '8px', fontSize: '14px', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}