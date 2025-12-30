import FriendItem from './FriendItem';
import { Friend } from '../../../entities/friends/FriendsApi';

interface FriendsListProps {
  friends: Friend[];
  onlineFriends: number[];
  onFriendClick?: (friendId: number) => void;
  onFriendRemoved?: () => void;
}

export default function FriendsList({ friends, onlineFriends, onFriendClick, onFriendRemoved }: FriendsListProps) {
  const isOnline = (friendId: number) => {
    return onlineFriends.includes(friendId);
  };

  if (friends.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        У вас пока нет друзей
      </div>
    );
  }

  return (
    <div>
      <h2>Мои друзья ({friends.length})</h2>
      <div>
        {friends.map((friend) => (
          <FriendItem
            key={friend.id}
            friend={friend}
            isOnline={isOnline(friend.id)}
            onFriendRemoved={onFriendRemoved}
          />
        ))}
      </div>
    </div>
  );
}