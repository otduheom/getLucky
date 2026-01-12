import { useGetPopularUsersQuery } from '../../../features/friends/friendsApi';
import UserCard from './UserCard';
import styles from './PopularUsersList.module.css';

export default function PopularUsersList() {
  const { data: users = [], isLoading: loading, error } = useGetPopularUsersQuery();

  if (loading) {
    return <div className={styles.loading}>Загрузка популярных пользователей...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        {'data' in error
          ? (error.data as any)?.message || 'Ошибка загрузки пользователей'
          : 'Ошибка загрузки пользователей'}
      </div>
    );
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