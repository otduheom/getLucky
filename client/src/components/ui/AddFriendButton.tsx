import { useState, useEffect } from 'react';
import { useGetFriendshipStatusQuery, useSendFriendRequestMutation } from '../../features/friends/friendsApi';
import { showToast } from '../../shared/lib/toast';
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
  onStatusChange,
}: AddFriendButtonProps) {
  const [sendFriendRequest, { isLoading: loading }] = useSendFriendRequestMutation();
  const { data: friendshipStatus } = useGetFriendshipStatusQuery(userId, {
    skip: !!initialStatus,
  });
  const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'blocked'>(
    initialStatus || 'none',
  );
  const [isRequester, setIsRequester] = useState(initialIsRequester || false);

  useEffect(() => {
    if (friendshipStatus) {
      setStatus(friendshipStatus.status);
      setIsRequester(friendshipStatus.isRequester || false);
      onStatusChange?.(friendshipStatus.status);
    } else if (initialStatus) {
      setStatus(initialStatus);
      setIsRequester(initialIsRequester || false);
    }
  }, [friendshipStatus, initialStatus, initialIsRequester, onStatusChange]);

  const handleClick = async () => {
    if (status === 'accepted') {
      return; // Уже друзья, кнопка не активна
    }
    try {
      // отправка заявки если статус none
      if (status === 'none') {
        // отправка заявки, изменение состояния и вызов колбеков
        await sendFriendRequest(userId).unwrap();
        setStatus('pending');
        setIsRequester(true);
        onStatusChange?.('pending');
        onSuccess?.();
        // отображение тоста
        showToast.success('Заявка отправлена');
      } else {
        // Можно добавить логику для других статусов
      }
    } catch (error: any) {
      // отображение тоста ошибки
      showToast.error(error.data?.message || error.message || 'Ошибка отправки заявки');
    }
  };
// динамическое отображение текста кнопки в зависимости от статуса
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
