import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import MessagesApi, { Message } from '../../entities/messages/MessagesApi';
import ProfileApi from '../../entities/profile/ProfileApi';
import FriendsApi from '../../entities/friends/FriendsApi';
import ChatHeader from './ChatPage/ChatHeader';
import MessagesList from './ChatPage/MessagesList';
import MessageInput from './ChatPage/MessageInput';
import { initSocket } from '../../shared/lib/socketInstance';
import { getAccessToken } from '../../shared/lib/axiosInstance';
import styles from './ChatPage/ChatPage.module.css';

interface ChatPageProps {
  currentUserId?: number;
}

export default function ChatPage({ currentUserId }: ChatPageProps) {
  const { friendId } = useParams<{ friendId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendName, setFriendName] = useState('');
  const [friendAvatar, setFriendAvatar] = useState<string | undefined>();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!friendId || !currentUserId) return;

    const friendIdNum = parseInt(friendId, 10);

    const fetchChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем сообщения
        const messagesList = await MessagesApi.getMessages(friendIdNum);
        setMessages(messagesList);

        // Получаем информацию о друге (через API профиля)
        try {
          const friendProfile = await ProfileApi.getProfile(friendIdNum);
          setFriendName(friendProfile.nickname || friendProfile.name);
          setFriendAvatar(friendProfile.avatar);
        } catch (err) {
          setFriendName('Пользователь');
        }

        // Проверяем онлайн статус
        const onlineFriends = await FriendsApi.getOnlineFriends();
        setIsOnline(onlineFriends.some(f => f.id === friendIdNum));

        // Отмечаем сообщения как прочитанные
        await MessagesApi.markAllAsRead(friendIdNum);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки чата');
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Инициализация WebSocket
    const token = getAccessToken();
    if (token) {
      const socket = initSocket(token);

      socket.on('new-message', (newMessage: Message) => {
        if (newMessage.senderId === friendIdNum || newMessage.receiverId === friendIdNum) {
          setMessages(prev => {
            // Проверяем, нет ли уже такого сообщения (избегаем дубликатов)
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          // Если это сообщение для нас, отмечаем как прочитанное
          if (newMessage.receiverId === currentUserId) {
            MessagesApi.markAllAsRead(friendIdNum);
          }
        }
      });

      socket.on('message-sent', (message: Message) => {
        // Обновляем сообщение, если оно уже есть в списке (например, после отправки через REST)
        setMessages(prev => {
          const existingIndex = prev.findIndex(msg => msg.id === message.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = message;
            return updated;
          }
          // Добавляем новое сообщение, если его еще нет
          return [...prev, message];
        });
      });

      socket.on('messages-read', (data: { userId?: number; friendId?: number }) => {
        // Обновляем статус прочитанных сообщений
        // Когда друг прочитал наши сообщения, нужно обновить статус сообщений, которые мы отправили ему
        // Сообщения, которые мы отправили: senderId === currentUserId && receiverId === friendIdNum
        setMessages(prev =>
          prev.map(msg =>
            msg.senderId === currentUserId && msg.receiverId === friendIdNum
              ? { ...msg, isRead: true }
              : msg
          )
        );
      });

      socket.on('user-online', (data: { userId: number }) => {
        if (data.userId === friendIdNum) {
          setIsOnline(true);
        }
      });

      socket.on('user-offline', (data: { userId: number }) => {
        if (data.userId === friendIdNum) {
          setIsOnline(false);
        }
      });

      return () => {
        socket.off('new-message');
        socket.off('message-sent');
        socket.off('messages-read');
        socket.off('user-online');
        socket.off('user-offline');
      };
    }
  }, [friendId, currentUserId]);

  const handleMessageSent = (message: Message) => {
    // Добавляем сообщение, если его еще нет (избегаем дубликатов с WebSocket)
    setMessages(prev => {
      if (prev.some(msg => msg.id === message.id)) {
        return prev; // Сообщение уже есть
      }
      return [...prev, message];
    });
  };

  if (!currentUserId) {
    return <div>Необходима авторизация</div>;
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        Загрузка чата...
      </div>
    );
  }

  if (error || !friendId) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        {error || 'Чат не найден'}
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <ChatHeader
        friendName={friendName}
        friendAvatar={friendAvatar}
        isOnline={isOnline}
        friendId={parseInt(friendId, 10)}
      />
      <MessagesList messages={messages} currentUserId={currentUserId} />
      <MessageInput
        receiverId={parseInt(friendId, 10)}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}

