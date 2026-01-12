import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGetChatsQuery } from '../../features/messages/messagesApi';
import { Chat } from '../../features/messages/messagesApi';
import ChatsList from './ChatsPage/ChatsList';
import ChatSearchForm from './ChatsPage/ChatSearchForm';
import styles from './ChatsPage/ChatsPage.module.css';

export default function ChatsPage() {
  const navigate = useNavigate();
  const { data: chats = [], isLoading: loading, error } = useGetChatsQuery();
  const [displayedChats, setDisplayedChats] = useState<Chat[]>([]);

  // Обновляем displayedChats при изменении chats
  useEffect(() => {
    setDisplayedChats(chats);
  }, [chats]);

  const handleSearchResults = (results: Chat[]) => {
    setDisplayedChats(results);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: '24px', textAlign: 'center', color: '#707579' }}>
          Загрузка чатов...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: '24px', color: '#d32f2f' }}>
          {'data' in error ? (error.data as any)?.message || 'Ошибка загрузки чатов' : 'Ошибка загрузки чатов'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Чаты</h1>
        <button
          onClick={() => navigate('/groups/create')}
          className={styles.createButton}
        >
          + Создать группу
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.searchContainer}>
          <ChatSearchForm chats={chats} onSearchResults={handleSearchResults} />
        </div>
        <div className={styles.chatsContainer}>
          {displayedChats.length === 0 && !loading ? (
            <div className={styles.emptyState}>Чаты не найдены</div>
          ) : (
            <ChatsList chats={displayedChats} />
          )}
        </div>
      </div>
    </div>
  );
}

