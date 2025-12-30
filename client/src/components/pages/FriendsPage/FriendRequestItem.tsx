import { useNavigate } from 'react-router';
import UserAvatar from '../../ui/UserAvatar';
import FriendsApi, { Friend } from '../../../entities/friends/FriendsApi';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';

interface FriendRequestItemProps {
  requestId: number;
  user: Friend;
  onAccepted: () => void;
}

export default function FriendRequestItem({ requestId, user, onAccepted }: FriendRequestItemProps) {
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!requestId) {
      console.error('requestId is undefined!', { requestId, user });
      alert('Ошибка: не указан ID заявки');
      return;
    }
    try {
      await FriendsApi.acceptFriendRequest(requestId);
      onAccepted();
      alert('Заявка принята');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка принятия заявки');
    }
  };

  const handleReject = async () => {
    // Отклоняем заявку через удаление (можно добавить отдельный endpoint для отклонения)
    if (!confirm(`Отклонить заявку от ${user.nickname || user.name}?`)) {
      return;
    }
    try {
      // Используем removeFriend для отклонения/удаления заявки
      await FriendsApi.removeFriend(user.id);
      onAccepted(); // Перезагружаем список
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка отклонения заявки');
    }
  };

  const displayName = user.nickname || 
    (user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.name);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '8px',
      }}
    >
      <div 
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/profile/${user.id}`)}
      >
        <UserAvatar 
          src={getAvatarUrl(user.avatar)}
          name={user.name} 
          size="md" 
        />
      </div>
      <div 
        style={{ flex: 1, cursor: 'pointer' }}
        onClick={() => navigate(`/profile/${user.id}`)}
      >
        <h3 style={{ margin: 0 }}>{displayName}</h3>
        {user.city && <p style={{ margin: '4px 0', color: '#666' }}>{user.city}</p>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleAccept}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Принять
        </button>
        <button
          onClick={handleReject}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Отклонить
        </button>
      </div>
    </div>
  );
}

