import { useEffect, useState } from 'react';
import FriendsApi from '../../../entities/friends/FriendsApi';
import MessageButton from '../../ui/MessageButton';

interface FriendshipActionsProps {
  userId: number;
  currentUserId: number;
}

export default function FriendshipActions({ userId, currentUserId }: FriendshipActionsProps) {
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFriendship = async () => {
      try {
        const status = await FriendsApi.getFriendshipStatus(userId);
        setIsFriend(status.status === 'accepted');
      } catch (error) {
        console.error('Ошибка проверки дружбы:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFriendship();
  }, [userId]);

  if (loading) {
    return null;
  }

  if (!isFriend) {
    return null; // Не показываем кнопку сообщения, если не друзья
  }

  return <MessageButton friendId={userId} />;
}

