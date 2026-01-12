import { useState, useEffect, useMemo, useRef } from 'react';
import { useGetFriendsQuery, useGetOnlineFriendsQuery, Friend } from '../../features/friends/friendsApi';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setOnlineFriends } from '../../features/friends/friendsSlice';
import FriendSearchForm from './FriendPage/FriendSearchForm';
import FriendsList from './FriendPage/FriendsList';
import FriendRequestsList from './FriendsPage/FriendRequestsList';
import styles from './FriendsPage.module.css';

export default function FriendsPage() {
  const { data: friends = [], isLoading: friendsLoading, error: friendsError } = useGetFriendsQuery();
  const { data: onlineFriendsData = [] } = useGetOnlineFriendsQuery();
  const onlineFriends = useAppSelector((state) => state.friends.onlineFriends);
  const dispatch = useAppDispatch();
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('requests');

  // Мемоизируем список ID онлайн друзей для стабильного сравнения
  const onlineIds = useMemo(() => {
    return onlineFriendsData.map(f => f.id).sort((a, b) => a - b);
  }, [onlineFriendsData]);

  // Обновляем онлайн друзей в Redux только если список изменился
  const prevOnlineIdsRef = useRef<string>('');
  useEffect(() => {
    const currentIdsString = JSON.stringify(onlineIds);
    if (prevOnlineIdsRef.current !== currentIdsString) {
      prevOnlineIdsRef.current = currentIdsString;
      dispatch(setOnlineFriends(onlineIds));
    }
  }, [onlineIds, dispatch]);

  const handleSearchResults = (results: Friend[]) => {
    setSearchResults(results);
    setIsSearching(results.length > 0);
  };

  const displayFriends = isSearching ? searchResults : friends;
  const loading = friendsLoading;
  const error = friendsError;

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
        <div className={styles.error}>
          {'data' in error ? (error.data as any)?.message || 'Ошибка загрузки друзей' : 'Ошибка загрузки друзей'}
        </div>
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