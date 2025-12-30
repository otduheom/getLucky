import { useNavigate } from 'react-router';
import UserAvatar from '../../ui/UserAvatar';
import styles from './ChatHeader.module.css';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';

interface ChatHeaderProps {
  friendName: string;
  friendAvatar?: string;
  isOnline: boolean;
  friendId: number;
}

export default function ChatHeader({ friendName, friendAvatar, isOnline, friendId }: ChatHeaderProps) {
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    navigate(`/profile/${friendId}`);
  };

  return (
    <div className={styles.header}>
      <div onClick={handleAvatarClick} className={styles.avatarContainer} style={{ cursor: 'pointer' }}>
        <UserAvatar src={getAvatarUrl(friendAvatar)} name={friendName} size="md" />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{friendName}</h3>
        <p className={`${styles.status} ${isOnline ? styles.online : ''}`}>
          {isOnline ? 'В сети' : 'Не в сети'}
        </p>
      </div>
    </div>
  );
}
