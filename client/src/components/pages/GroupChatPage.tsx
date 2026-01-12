import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { useGetGroupMessagesQuery, useMarkGroupMessagesAsReadMutation } from '../../features/messages/messagesApi';
import { useGetGroupQuery } from '../../features/groups/groupsApi';
import { setActiveChat } from '../../features/messages/messagesSlice';
import { setActiveGroup } from '../../features/groups/groupsSlice';
import GroupChatHeader from './GroupChatPage/GroupChatHeader';
import GroupMessagesList from './GroupChatPage/GroupMessagesList';
import GroupMessageInput from './GroupChatPage/GroupMessageInput';
import styles from './ChatPage/ChatPage.module.css';

export default function GroupChatPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const dispatch = useAppDispatch();

  const groupIdNum = groupId ? parseInt(groupId, 10) : null;

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useGetGroupMessagesQuery(groupIdNum!, { skip: !groupIdNum });

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGetGroupQuery(groupIdNum!, { skip: !groupIdNum });

  const [markGroupMessagesAsRead] = useMarkGroupMessagesAsReadMutation();

  useEffect(() => {
    if (groupIdNum) {
      dispatch(setActiveChat({ chatId: groupIdNum, type: 'group' }));
      dispatch(setActiveGroup(groupIdNum));
      // Отмечаем сообщения как прочитанные при открытии чата
      markGroupMessagesAsRead(groupIdNum);
    }
    return () => {
      dispatch(setActiveChat(null));
      dispatch(setActiveGroup(null));
    };
  }, [groupIdNum, dispatch, markGroupMessagesAsRead]);

  const loading = messagesLoading || groupLoading;
  const error = messagesError || groupError;

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
          {error
            ? 'data' in error
              ? (error.data as any)?.message || 'Ошибка загрузки чата'
              : 'Ошибка загрузки чата'
            : 'Группа не найдена'}
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
      <GroupMessageInput groupId={parseInt(groupId, 10)} />
    </div>
  );
}