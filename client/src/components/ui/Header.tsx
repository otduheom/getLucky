import { NavLink, useNavigate } from 'react-router';
import UserApi from '../../entities/user/UserApi';
import { setAccessToken } from '../../shared/lib/axiosInstance';
import styles from './Header.module.css';

interface HeaderProps {
  user: {
    status: 'logging' | 'logged' | 'guest';
    data: {
      name: string;
      email: string;
    } | null;
  };
  setUser: (user: HeaderProps['user']) => void;
}

function Header({ user, setUser }: HeaderProps) {
  const navigate = useNavigate();
// обработчик выхода, при выходе из аккаунта дает текущему юзеру статус гостя, сбрасывает токен и выкидывает юзера на главную
  const logoutHandler = async () => {
    try {
      await UserApi.logout();
      setUser({ status: 'guest', data: null });
      setAccessToken('');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header role="banner" className={styles.header}>
      <div className={styles.navContainer}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                Главная
              </NavLink>
            </li>
            {user?.status === 'logged' ? (
              <>
                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Профиль
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/friends"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Друзья
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/chats"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Чаты
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className={styles.userName}
                  >
                    {user?.data?.name}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/"
                    onClick={logoutHandler}
                    className={styles.navLink}
                  >
                    Выйти
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/signup"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Регистрация
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Вход
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;

