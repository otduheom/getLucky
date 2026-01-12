import { useAppSelector } from '../../app/hooks';
import PopularUsersList from './HomePage/PopularUsersList';
import UserSearchForm from './HomePage/UserSearchForm';
import styles from './MainPage.module.css';

export default function MainPage() {
  const auth = useAppSelector((state) => state.auth);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Главная страница</h1>
      
      {auth.status === 'logged' ? (
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