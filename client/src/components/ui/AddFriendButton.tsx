import { useState } from 'react';
import FriendsApi from '../../entities/friends/FriendsApi';
import styles from './AddFriendButton.module.css';

interface AddFriendButtonProps {
  userId: number;
  onSuccess?: () => void;
}

export default function AddFriendButton({ userId, onSuccess }: AddFriendButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await FriendsApi.sendFriendRequest(userId);
      onSuccess?.();
      alert('Заявка отправлена');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка отправки заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Отправка...' : 'Добавить в друзья'}
    </button>
  );
}