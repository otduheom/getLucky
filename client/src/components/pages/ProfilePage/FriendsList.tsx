import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import FriendsApi, { Friend } from '../../../entities/friends/FriendsApi';
import UserAvatar from '../../ui/UserAvatar';
import OnlineIndicator from '../../ui/OnlineIndicator';
import MessageButton from '../../ui/MessageButton';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';

interface FriendsListProps {
  userId: number;
  isOwnProfile: boolean;
  currentUserId?: number;
}

export default function FriendsList({ userId, isOwnProfile, currentUserId }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const friendsList = await FriendsApi.getFriends();
        setFriends(friendsList);

        // Получаем список онлайн друзей
        const online = await FriendsApi.getOnlineFriends();
        setOnlineFriends(online.map(f => f.id));
      } catch (error: any) {
        console.error('Ошибка загрузки друзей:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOwnProfile) {
      fetchFriends();
    }
  }, [userId, isOwnProfile]);

  const isOnline = (friendId: number) => {
    return onlineFriends.includes(friendId);
  };

  const handleFriendClick = (friendId: number) => {
    navigate(`/profile/${friendId}`);
  };

  const displayName = (friend: Friend) => {
    return friend.nickname || 
      (friend.firstName && friend.lastName 
        ? `${friend.firstName} ${friend.lastName}` 
        : friend.name);
  };

  if (!isOwnProfile) {
    return null; // Не показываем список друзей для чужих профилей
  }

  if (loading) {
    return <div>Загрузка друзей...</div>;
  }

  if (friends.length === 0) {
    return <div>У вас пока нет друзей</div>;
  }

  return (
    <div>
      <h2>Мои друзья ({friends.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {friends.map((friend) => (
          <div
            key={friend.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onClick={() => handleFriendClick(friend.id)}
          >
            <div style={{ position: 'relative' }}>
              <UserAvatar 
                src={getAvatarUrl(friend.avatar)}
                name={friend.name} 
                size="md" 
              />
              <OnlineIndicator isOnline={isOnline(friend.id)} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{displayName(friend)}</h3>
              {friend.city && <p style={{ margin: '4px 0', color: '#666' }}>{friend.city}</p>}
            </div>
            <MessageButton friendId={friend.id} />
          </div>
        ))}
      </div>
    </div>
  );
}