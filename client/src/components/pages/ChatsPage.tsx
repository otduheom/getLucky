import { useEffect, useState } from 'react';
import MessagesApi, { Chat } from '../../entities/messages/MessagesApi';
import ChatsList from './ChatsPage/ChatsList';
import ChatSearchForm from './ChatsPage/ChatSearchForm';
import styles from './ChatsPage/ChatsPage.module.css';

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [displayedChats, setDisplayedChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);
        const chatsList = await MessagesApi.getChats();
        setChats(chatsList);
        setDisplayedChats(chatsList);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки чатов');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

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
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Чаты</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.searchContainer}>
          <ChatSearchForm chats={chats} onSearchResults={handleSearchResults} />
        </div>
        <div className={styles.chatsContainer}>
          {displayedChats.length === 0 ? (
            <div className={styles.emptyState}>Чаты не найдены</div>
          ) : (
            <ChatsList chats={displayedChats} />
          )}
        </div>
      </div>
    </div>
  );
}

