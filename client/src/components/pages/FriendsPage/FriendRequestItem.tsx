import { useNavigate } from 'react-router';
import UserAvatar from '../../ui/UserAvatar';
import { Friend } from '../../../features/friends/friendsApi';
import { useAcceptFriendRequestMutation, useRemoveFriendMutation } from '../../../features/friends/friendsApi';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';
import { showToast } from '../../../shared/lib/toast';

interface FriendRequestItemProps {
  requestId: number;
  user: Friend;
  onAccepted?: () => void;
}

export default function FriendRequestItem({ requestId, user, onAccepted }: FriendRequestItemProps) {
  const navigate = useNavigate();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [removeFriend] = useRemoveFriendMutation();

  const handleAccept = async () => {
    if (!requestId) {
      console.error('requestId is undefined!', { requestId, user });
      showToast.error('Ошибка: не указан ID заявки');
      return;
    }
    try {
      await acceptFriendRequest(requestId).unwrap();
      onAccepted?.();
      showToast.success('Заявка принята');
    } catch (error: any) {
      showToast.error(error.data?.message || error.message || 'Ошибка принятия заявки');
    }
  };

  const handleReject = async () => {
    // Отклоняем заявку через удаление (можно добавить отдельный endpoint для отклонения)
    if (!confirm(`Отклонить заявку от ${user.nickname || user.name}?`)) {
      return;
    }
    try {
      // Используем removeFriend для отклонения/удаления заявки
      await removeFriend(user.id).unwrap();
      onAccepted?.(); // Перезагружаем список
    } catch (error: any) {
      showToast.error(error.data?.message || error.message || 'Ошибка отклонения заявки');
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

