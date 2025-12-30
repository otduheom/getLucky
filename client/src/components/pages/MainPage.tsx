import PopularUsersList from './HomePage/PopularUsersList';
import UserSearchForm from './HomePage/UserSearchForm';
import styles from './MainPage.module.css';

interface MainPageProps {
  user: {
    status: 'logging' | 'logged' | 'guest';
    data: {
      name: string;
      email: string;
    } | null;
  };
}

export default function MainPage({ user }: MainPageProps) {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Главная страница</h1>
      
      {user?.status === 'logged' ? (
        <>
          <UserSearchForm />
          <PopularUsersList />
        </>
      ) : (
        <div className={styles.guestMessage}>
          <p>Войдите в систему, чтобы увидеть популярных пользователей и найти новых друзей.</p>
        </div>
      )}
    </div>
  );
}