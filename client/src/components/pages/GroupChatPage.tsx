import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import MessagesApi, { Message } from '../../entities/messages/MessagesApi';
import GroupsApi, { Group } from '../../entities/groups/GroupsApi';
import GroupChatHeader from './GroupChatPage/GroupChatHeader';
import GroupMessagesList from './GroupChatPage/GroupMessagesList';
import GroupMessageInput from './GroupChatPage/GroupMessageInput';
import { initSocket } from '../../shared/lib/socketInstance';
import { getAccessToken } from '../../shared/lib/axiosInstance';
import styles from './ChatPage/ChatPage.module.css';

interface GroupChatPageProps {
  currentUserId?: number;
}

export default function GroupChatPage({ currentUserId }: GroupChatPageProps) {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId || !currentUserId) return;

    const groupIdNum = parseInt(groupId, 10);

    const fetchChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем сообщения группы
        const messagesList = await MessagesApi.getGroupMessages(groupIdNum);
        setMessages(messagesList);

        // Получаем информацию о группе
        try {
          const groupData = await GroupsApi.getGroup(groupIdNum);
          setGroup(groupData);
        } catch (err) {
          setError('Группа не найдена');
        }

        // Отмечаем сообщения как прочитанные
        await MessagesApi.markGroupMessagesAsRead(groupIdNum);
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

      socket.on('new-group-message', (newMessage: Message) => {
        if (newMessage.groupId === groupIdNum) {
          setMessages((prev) => {
            // Проверяем, нет ли уже такого сообщения (избегаем дубликатов)
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          // Отмечаем как прочитанное
          if (newMessage.senderId !== currentUserId) {
            MessagesApi.markGroupMessagesAsRead(groupIdNum);
          }
        }
      });

      // Убираем обработчик chats-updated, так как сообщения обновляются через new-group-message
      // и handleMessageSent. Полная перезагрузка не нужна и вызывает ререндер страницы.

      return () => {
        socket.off('new-group-message');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, currentUserId]);

  const handleMessageSent = (message: Message) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((msg) => msg.id === message.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = message;
        return updated;
      }
      return [...prev, message];
    });
  };

  if (loading) {
    return (
      <div className={styles.chatContainer}>
        <div style={{ padding: '24px', textAlign: 'center', color: '#707579' }}>
          Загрузка чата...
        </div>
      </div>
    );
  }

  if (error || !groupId || !group) {
    return (
      <div className={styles.chatContainer}>
        <div style={{ padding: '24px', color: 'red' }}>
          {error || 'Группа не найдена'}
        </div>
        <button onClick={() => navigate('/chats')} style={{ margin: '16px' }}>
          Вернуться к чатам
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <GroupChatHeader group={group} currentUserId={currentUserId} />
      <GroupMessagesList messages={messages} currentUserId={currentUserId} />
      <GroupMessageInput groupId={parseInt(groupId, 10)} onMessageSent={handleMessageSent} />
    </div>
  );
}