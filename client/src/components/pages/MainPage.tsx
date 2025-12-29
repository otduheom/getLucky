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
      <h1 className={styles.mainTitle}>Расклад на Таро</h1>
      {user?.status === 'logged' ? (
        <div className={styles.guestMessage}>
          <p className={styles.guestMessageText}>
            Добро пожаловать! Функционал расклада скоро будет доступен.
          </p>
        </div>
      ) : (
        <div className={styles.guestMessage}>
          <p className={styles.guestMessageText}>
            Войдите в систему, чтобы получить расклад на картах Таро.
          </p>
        </div>
      )}
    </div>
  );
}
