import { useNavigate } from 'react-router';
import UserAvatar from '../../ui/UserAvatar';
import OnlineIndicator from '../../ui/OnlineIndicator';
import MessageButton from '../../ui/MessageButton';
import { Friend } from '../../../features/friends/friendsApi';
import { useRemoveFriendMutation } from '../../../features/friends/friendsApi';
import styles from './FriendItem.module.css';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';
import { showToast } from '../../../shared/lib/toast';

interface FriendItemProps {
  friend: Friend;
  isOnline: boolean;
  onFriendRemoved?: () => void;
}

export default function FriendItem({ friend, isOnline, onFriendRemoved }: FriendItemProps) {
  const navigate = useNavigate();
  const [removeFriend, { isLoading: isRemoving }] = useRemoveFriendMutation();

  const handleFriendClick = () => {
    navigate(`/profile/${friend.id}`);
  };

  const handleRemoveFriend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Вы уверены, что хотите удалить ${friend.nickname || friend.name} из друзей?`)) {
      return;
    }

    try {
      await removeFriend(friend.id).unwrap();
      onFriendRemoved?.();
    } catch (error: any) {
      showToast.error(error.data?.message || error.message || 'Ошибка удаления друга');
    }
  };

  const displayName = friend.nickname || 
    (friend.firstName && friend.lastName 
      ? `${friend.firstName} ${friend.lastName}` 
      : friend.name);

  return (
    <div
      className={styles.friendItem}
      onClick={handleFriendClick}
    >
      <div className={styles.avatarContainer}>
        <UserAvatar 
          src={getAvatarUrl(friend.avatar)}
          name={friend.name} 
          size="md" 
        />
        <OnlineIndicator isOnline={isOnline} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{displayName}</h3>
        {friend.city && (
          <p className={styles.city}>
            {friend.city}
          </p>
        )}
      </div>
      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        <MessageButton friendId={friend.id} />
        <button
          onClick={handleRemoveFriend}
          disabled={isRemoving}
          className={styles.removeButton}
        >
          {isRemoving ? 'Удаление...' : 'Удалить'}
        </button>
      </div>
    </div>
  );
}