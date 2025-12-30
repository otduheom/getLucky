import { useEffect, useState } from 'react';
import FriendsApi, { Friend } from '../../../entities/friends/FriendsApi';
import UserCard from './UserCard';
import styles from './PopularUsersList.module.css';

export default function PopularUsersList() {
  const [users, setUsers] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularUsers = async () => {
      try {
        setLoading(true);
        const popularUsers = await FriendsApi.getPopularUsers();
        setUsers(popularUsers);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки пользователей');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularUsers();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Загрузка популярных пользователей...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (users.length === 0) {
    return <div className={styles.empty}>Популярные пользователи не найдены</div>;
  }

  return (
    <div>
      <h2>Популярные пользователи</h2>
      <div className={styles.usersContainer}>
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}