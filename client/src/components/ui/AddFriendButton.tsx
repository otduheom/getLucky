import { useState, useEffect } from 'react';
import FriendsApi from '../../entities/friends/FriendsApi';
import styles from './AddFriendButton.module.css';

interface AddFriendButtonProps {
  userId: number;
  onSuccess?: () => void;
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'blocked';
  isRequester?: boolean;
  onStatusChange?: (status: 'none' | 'pending' | 'accepted' | 'blocked') => void;
}

export default function AddFriendButton({ 
  userId, 
  onSuccess, 
  friendshipStatus: initialStatus,
  isRequester: initialIsRequester,
  onStatusChange
}: AddFriendButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'blocked'>(initialStatus || 'none');
  const [isRequester, setIsRequester] = useState(initialIsRequester || false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const friendshipStatus = await FriendsApi.getFriendshipStatus(userId);
        setStatus(friendshipStatus.status);
        setIsRequester(friendshipStatus.isRequester || false);
        onStatusChange?.(friendshipStatus.status);
      } catch (error) {
        console.error('Ошибка получения статуса дружбы:', error);
      }
    };

    if (!initialStatus) {
      fetchStatus();
    } else {
      setStatus(initialStatus);
      setIsRequester(initialIsRequester || false);
    }
  }, [userId, initialStatus, initialIsRequester, onStatusChange]);

  const handleClick = async () => {
    if (status === 'accepted') {
      return; // Уже друзья, кнопка не активна
    }

    setLoading(true);
    try {
      if (status === 'none') {
        await FriendsApi.sendFriendRequest(userId);
        setStatus('pending');
        setIsRequester(true);
        onStatusChange?.('pending');
        onSuccess?.();
        alert('Заявка отправлена');
      } else {
        // Можно добавить логику для других статусов
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка отправки заявки');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (status === 'accepted') {
      return 'Уже друзья';
    }
    if (status === 'pending') {
      return isRequester ? 'Заявка отправлена' : 'Заявка получена';
    }
    return loading ? 'Отправка...' : 'Добавить в друзья';
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      disabled={loading || status === 'accepted'}
      style={{
        opacity: status === 'accepted' ? 0.6 : 1,
        cursor: status === 'accepted' ? 'not-allowed' : 'pointer',
      }}
    >
      {getButtonText()}
    </button>
  );
}
