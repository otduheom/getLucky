import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { useGetMessagesQuery, useMarkAllAsReadMutation } from '../../features/messages/messagesApi';
import { useGetProfileQuery } from '../../features/profile/profileApi';
import { setActiveChat } from '../../features/messages/messagesSlice';
import ChatHeader from './ChatPage/ChatHeader';
import MessagesList from './ChatPage/MessagesList';
import MessageInput from './ChatPage/MessageInput';
import styles from './ChatPage/ChatPage.module.css';

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const onlineFriends = useAppSelector((state) => state.friends.onlineFriends);
  const dispatch = useAppDispatch();

  const friendIdNum = friendId ? parseInt(friendId, 10) : null;

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useGetMessagesQuery(friendIdNum!, { skip: !friendIdNum });

  const {
    data: friendProfile,
    isLoading: profileLoading,
  } = useGetProfileQuery(friendIdNum!, { skip: !friendIdNum });

  const [markAllAsRead] = useMarkAllAsReadMutation();

  const isOnline = friendIdNum ? onlineFriends.includes(friendIdNum) : false;

  useEffect(() => {
    if (friendIdNum) {
      dispatch(setActiveChat({ chatId: friendIdNum, type: 'private' }));
      // Отмечаем сообщения как прочитанные при открытии чата
      markAllAsRead(friendIdNum);
    }
    return () => {
      dispatch(setActiveChat(null));
    };
  }, [friendIdNum, dispatch, markAllAsRead]);

  if (!currentUserId) {
    return <div>Необходима авторизация</div>;
  }

  if (messagesLoading || profileLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        Загрузка чата...
      </div>
    );
  }

  if (messagesError || !friendId) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        {messagesError ? 'Ошибка загрузки чата' : 'Чат не найден'}
      </div>
    );
  }

  const friendName = friendProfile?.nickname || friendProfile?.name || 'Пользователь';
  const friendAvatar = friendProfile?.avatar;

  return (
    <div className={styles.chatContainer}>
      <ChatHeader
        friendName={friendName}
        friendAvatar={friendAvatar}
        isOnline={isOnline}
        friendId={friendIdNum!}
      />
      <MessagesList messages={messages} currentUserId={currentUserId} />
      <MessageInput receiverId={friendIdNum!} />
    </div>
  );
}

