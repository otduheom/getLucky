import { useNavigate } from 'react-router';
import UserAvatar from '../../ui/UserAvatar';
import UnreadBadge from '../../ui/UnreadBadge';
import { Chat } from '../../../entities/messages/MessagesApi';
import styles from './ChatItem.module.css';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';

interface ChatItemProps {
  chat: Chat;
}

export default function ChatItem({ chat }: ChatItemProps) {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate(`/chat/${chat.friend.id}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'сейчас';
    if (minutes < 60) return `${minutes} мин`;
    if (hours < 24) return `${hours} ч`;
    if (days < 7) return `${days} дн`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const displayName = chat.friend.nickname || 
    (chat.friend.firstName && chat.friend.lastName 
      ? `${chat.friend.firstName} ${chat.friend.lastName}` 
      : chat.friend.name);

  return (
    <div onClick={handleChatClick} className={styles.chatItem}>
      <div className={styles.avatarContainer}>
        <UserAvatar
          src={getAvatarUrl(chat.friend.avatar)}
          name={displayName}
          size="md"
        />
      </div>
      <div className={styles.content}>
        <div className={styles.topRow}>
          <h3 className={styles.name}>{displayName}</h3>
          {chat.lastMessage && (
            <span className={styles.time}>
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className={styles.bottomRow}>
          {chat.lastMessage && (
            <p className={styles.lastMessage}>
              {chat.lastMessage.text}
            </p>
          )}
          {chat.unreadCount > 0 && (
            <div className={styles.unreadBadge}>
              <UnreadBadge count={chat.unreadCount} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

