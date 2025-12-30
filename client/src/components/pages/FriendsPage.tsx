import { useEffect, useState } from 'react';
import FriendsApi, { Friend } from '../../entities/friends/FriendsApi';
import FriendSearchForm from './FriendPage/FriendSearchForm';
import FriendsList from './FriendPage/FriendsList';
import FriendRequestsList from './FriendsPage/FriendRequestsList';
import styles from './FriendsPage.module.css';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('requests');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем список всех друзей
        const friendsList = await FriendsApi.getFriends();
        setFriends(friendsList);

        // Получаем список онлайн друзей
        const online = await FriendsApi.getOnlineFriends();
        setOnlineFriends(online.map(f => f.id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки друзей');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleSearchResults = (results: Friend[]) => {
    setSearchResults(results);
    setIsSearching(results.length > 0);
  };

  const displayFriends = isSearching ? searchResults : friends;

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>Загрузка друзей...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Друзья</h1>
      
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('requests')}
          className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
        >
          Заявки в друзья
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
        >
          Мои друзья
        </button>
      </div>

      {activeTab === 'requests' && <FriendRequestsList />}

      {activeTab === 'friends' && (
        <>
          <FriendSearchForm 
            onSearchResults={handleSearchResults}
            onlineFriends={onlineFriends}
          />

          {!isSearching && (
            <FriendsList 
              friends={friends} 
              onlineFriends={onlineFriends}
              onFriendRemoved={() => {
                // Перезагружаем список друзей после удаления
                const fetchFriends = async () => {
                  try {
                    setLoading(true);
                    const friendsList = await FriendsApi.getFriends();
                    setFriends(friendsList);
                    const online = await FriendsApi.getOnlineFriends();
                    setOnlineFriends(online.map(f => f.id));
                  } catch (err: any) {
                    setError(err.response?.data?.message || 'Ошибка загрузки друзей');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchFriends();
              }}
            />
          )}

          {isSearching && searchResults.length === 0 && (
            <div className={styles.emptySearch}>
              По вашему запросу друзья не найдены
            </div>
          )}
        </>
      )}
    </div>
  );
}